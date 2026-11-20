const { Op } = require('sequelize');
const sequelize = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');
const {
    escalar,
    escalarDesdeBd,
    centavosATexto,
    redondearPositivo,
    validarImporte,
} = require('../helpers/math.helper');

const { models } = sequelize;

// Constantes legales El Salvador (valores escalados en centavos)
const TOPE_ISSS_QUINCENAL_CENTAVOS = 50000n; // $500.00 ($1,000.00 mensual / 2)

// Tramos ISR Quincenal El Salvador (Decreto Ejecutivo vigente desde mayo 2025)
const TRAMO_1_HASTA = 27500n;  // $275.00
const TRAMO_2_HASTA = 44762n;  // $447.62
const TRAMO_3_HASTA = 101905n; // $1,019.05

function calcularIsrQuincenalCentavos(rentaImponible) {
    if (rentaImponible <= TRAMO_1_HASTA) {
        return 0n;
    }
    if (rentaImponible <= TRAMO_2_HASTA) {
        const exceso = rentaImponible - TRAMO_1_HASTA;
        return redondearPositivo(exceso * 10n, 100n) + 883n;
    }
    if (rentaImponible <= TRAMO_3_HASTA) {
        const exceso = rentaImponible - TRAMO_2_HASTA;
        return redondearPositivo(exceso * 20n, 100n) + 3000n;
    }
    const exceso = rentaImponible - TRAMO_3_HASTA;
    return redondearPositivo(exceso * 30n, 100n) + 14428n;
}

class PlanillaService {
    async findAll(query = {}) {
        const { limit, offset, sucursalId, estado, periodo } = query;

        const options = {
            where: {},
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre'] },
            ],
            order: [['id', 'DESC']],
        };

        if (limit !== undefined) options.limit = Number(limit);
        if (offset !== undefined) options.offset = Number(offset);
        if (sucursalId !== undefined) options.where.sucursalId = sucursalId;
        if (estado) options.where.estado = estado;
        if (periodo) {
            options.where.periodo = { [Op.iLike]: `%${periodo}%` };
        }

        return models.Planilla.findAll(options);
    }

    async findOne(id) {
        const planilla = await models.Planilla.findByPk(id, {
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre'] },
                {
                    association: 'detalles',
                    include: [
                        {
                            association: 'empleado',
                            attributes: ['id', 'nombres', 'apellidos', 'dui', 'puesto'],
                        },
                    ],
                },
            ],
        });

        if (!planilla) {
            throw new HttpError(404, `La planilla con ID ${id} no existe`);
        }

        return planilla;
    }

    async generar(data) {
        const planillaId = await sequelize.transaction(async (transaction) => {
            const sucursal = await models.Sucursal.findByPk(data.sucursalId, { transaction });
            if (!sucursal || !sucursal.activa) {
                throw new HttpError(400, 'La sucursal indicada no existe o está inactiva');
            }

            // Evita duplicar planillas para el mismo rango de fechas y sucursal
            const planillaExistente = await models.Planilla.findOne({
                where: {
                    sucursalId: data.sucursalId,
                    fechaInicio: data.fechaInicio,
                    fechaFin: data.fechaFin,
                },
                transaction,
            });

            if (planillaExistente) {
                throw new HttpError(
                    409,
                    `Ya existe una planilla registrada del ${data.fechaInicio} al ${data.fechaFin} en esta sucursal`
                );
            }

            const empleados = await models.Empleado.findAll({
                where: {
                    sucursalId: data.sucursalId,
                    activo: true,
                },
                order: [['id', 'ASC']],
                transaction,
            });

            if (empleados.length === 0) {
                throw new HttpError(400, 'No hay empleados activos en esta sucursal para generar planilla');
            }

            let totalBruto = 0n;
            let totalIsss = 0n;
            let totalAfp = 0n;
            let totalIsr = 0n;
            let totalNeto = 0n;

            const detallesPayload = empleados.map((emp) => {
                const salarioMensual = escalarDesdeBd(emp.salarioMensual, 2);
                // La planilla es quincenal: la mitad del salario mensual.
                const salarioBase = redondearPositivo(salarioMensual, 2n);

                // ISSS 3% con techo quincenal de $500.00
                const baseIsss = salarioBase > TOPE_ISSS_QUINCENAL_CENTAVOS
                    ? TOPE_ISSS_QUINCENAL_CENTAVOS
                    : salarioBase;
                const isss = redondearPositivo(baseIsss * 3n, 100n);

                // AFP 7.25% (725 / 10000)
                const afp = redondearPositivo(salarioBase * 725n, 10000n);

                // Renta imponible y cálculo de ISR quincenal
                const rentaImponible = salarioBase - isss - afp;
                const isr = calcularIsrQuincenalCentavos(rentaImponible);

                const otrasDeducciones = 0n;
                const salarioNeto = salarioBase - isss - afp - isr - otrasDeducciones;

                totalBruto += salarioBase;
                totalIsss += isss;
                totalAfp += afp;
                totalIsr += isr;
                totalNeto += salarioNeto;

                return {
                    empleadoId: emp.id,
                    salarioBruto: centavosATexto(salarioBase),
                    isss: centavosATexto(isss),
                    afp: centavosATexto(afp),
                    isr: centavosATexto(isr),
                    otrasDeducciones: '0.00',
                    salarioNeto: centavosATexto(salarioNeto),
                };
            });

            const nuevaPlanilla = await models.Planilla.create(
                {
                    sucursalId: data.sucursalId,
                    fechaInicio: data.fechaInicio,
                    fechaFin: data.fechaFin,
                    estado: 'borrador',
                    creadaPor: data.creadaPor ?? null,
                },
                { transaction }
            );

            await models.PlanillaDetalle.bulkCreate(
                detallesPayload.map((item) => ({
                    ...item,
                    planillaId: nuevaPlanilla.id,
                })),
                { transaction }
            );

            return nuevaPlanilla.id;
        });

        return this.findOne(planillaId);
    }

    async updateDetalle(detalleId, data) {
        const otrasDeduccionesCentavos = escalar(data.otrasDeducciones, 2, 'otrasDeducciones');
        validarImporte(otrasDeduccionesCentavos);

        const planillaId = await sequelize.transaction(async (transaction) => {
            const detalle = await models.PlanillaDetalle.findByPk(detalleId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!detalle) {
                throw new HttpError(404, `El detalle de planilla con ID ${detalleId} no existe`);
            }

            const planilla = await models.Planilla.findByPk(detalle.planillaId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (planilla.estado !== 'borrador') {
                throw new HttpError(
                    400,
                    `No se pueden modificar deducciones porque la planilla está en estado "${planilla.estado}"`
                );
            }

            const salarioBase = escalarDesdeBd(detalle.salarioBase, 2);
            const isss = escalarDesdeBd(detalle.isss, 2);
            const afp = escalarDesdeBd(detalle.afp, 2);
            const isr = escalarDesdeBd(detalle.isr, 2);
            const deduccionesLegales = isss + afp + isr;

            if (deduccionesLegales + otrasDeduccionesCentavos > salarioBase) {
                throw new HttpError(
                    400,
                    'Las deducciones totales no pueden superar el salario base quincenal del empleado'
                );
            }

            const nuevoSalarioNeto = salarioBase - deduccionesLegales - otrasDeduccionesCentavos;

            await detalle.update(
                {
                    otrasDeducciones: centavosATexto(otrasDeduccionesCentavos),
                    salarioNeto: centavosATexto(nuevoSalarioNeto),
                },
                { transaction }
            );

            // Recalcula el totalNeto global de la planilla
            const todosDetalles = await models.PlanillaDetalle.findAll({
                where: { planillaId: planilla.id },
                transaction,
            });

            let nuevoTotalNeto = 0n;
            for (const item of todosDetalles) {
                nuevoTotalNeto += escalarDesdeBd(item.salarioNeto, 2);
            }

            await planilla.update(
                { totalNeto: centavosATexto(nuevoTotalNeto) },
                { transaction }
            );

            return planilla.id;
        });

        return this.findOne(planillaId);
    }

    async cambiarEstado(id, nuevoEstado) {
        const transicionesValidas = {
            borrador: ['aprobada'],
            aprobada: ['pagada'],
            pagada: [],
        };

        const planillaId = await sequelize.transaction(async (transaction) => {
            const planilla = await models.Planilla.findByPk(id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!planilla) {
                throw new HttpError(404, `La planilla con ID ${id} no existe`);
            }

            const permitidos = transicionesValidas[planilla.estado] || [];
            if (!permitidos.includes(nuevoEstado)) {
                throw new HttpError(
                    400,
                    `Transición de estado inválida: no se puede pasar de "${planilla.estado}" a "${nuevoEstado}"`
                );
            }

            await planilla.update({ estado: nuevoEstado }, { transaction });
            return planilla.id;
        });

        return this.findOne(planillaId);
    }
}

module.exports = { PlanillaService };