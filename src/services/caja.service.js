const { Op } = require('sequelize');
const sequelize = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');
const {
    escalar,
    escalarDesdeBd,
    centavosATexto,
    validarImporte,
    centavosConSignoATexto,
} = require('../helpers/math.helper');

const { models } = sequelize;

class CajaService {
    async findAll(query = {}) {
        const { limit, offset, sucursalId, estado, fechaInicio, fechaFin } = query;

        const options = {
            where: {},
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre'] },
                { association: 'usuarioApertura', attributes: ['id', 'nombre', 'email'] },
                { association: 'usuarioCierre', attributes: ['id', 'nombre', 'email'] },
            ],
            order: [['id', 'DESC']],
        };

        if (limit !== undefined) options.limit = Number(limit);
        if (offset !== undefined) options.offset = Number(offset);
        if (sucursalId !== undefined) options.where.sucursalId = sucursalId;
        if (estado) options.where.estado = estado;

        if (fechaInicio || fechaFin) {
            options.where.fechaApertura = {};
            if (fechaInicio) options.where.fechaApertura[Op.gte] = fechaInicio;
            if (fechaFin) options.where.fechaApertura[Op.lte] = fechaFin;
        }

        return models.Caja.findAll(options);
    }

    async findOne(id) {
        const caja = await models.Caja.findByPk(id, {
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre'] },
                { association: 'usuarioApertura', attributes: ['id', 'nombre', 'email'] },
                { association: 'usuarioCierre', attributes: ['id', 'nombre', 'email'] },
                {
                    association: 'movimientos',
                    include: [{ association: 'usuario', attributes: ['id', 'nombre'] }],
                },
            ],
        });

        if (!caja) {
            throw new HttpError(404, `La caja con ID ${id} no existe`);
        }

        return caja;
    }

    // Consulta rápida de la caja actualmente abierta en una sucursal
    async findAbiertaPorSucursal(sucursalId) {
        const caja = await models.Caja.findOne({
            where: {
                sucursalId,
                estado: 'abierta',
            },
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre'] },
                { association: 'usuarioApertura', attributes: ['id', 'nombre', 'email'] },
                { association: 'movimientos' },
            ],
        });

        if (!caja) {
            throw new HttpError(404, 'No hay ninguna caja abierta actualmente en esta sucursal');
        }

        return caja;
    }

    async abrir(data, usuarioId) {
        const montoInicialCentavos = escalar(data.montoInicial, 2, 'montoInicial');
        validarImporte(montoInicialCentavos);

        const cajaId = await sequelize.transaction(async (transaction) => {
            const sucursal = await models.Sucursal.findByPk(data.sucursalId, { transaction });
            if (!sucursal || !sucursal.activa) {
                throw new HttpError(400, 'La sucursal no existe o está inactiva');
            }

            // Regla de negocio: solo puede haber UNA caja abierta por sucursal
            const cajaExistente = await models.Caja.findOne({
                where: {
                    sucursalId: data.sucursalId,
                    estado: 'abierta',
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (cajaExistente) {
                throw new HttpError(
                    400,
                    `Ya existe una caja abierta (#${cajaExistente.id}) en esta sucursal. Ciérrala antes de abrir una nueva.`
                );
            }

            const nuevaCaja = await models.Caja.create(
                {
                    sucursalId: data.sucursalId,
                    usuarioAperturaId: usuarioId,
                    montoInicial: centavosATexto(montoInicialCentavos),
                    estado: 'abierta',
                },
                { transaction }
            );

            return nuevaCaja.id;
        });

        return this.findOne(cajaId);
    }

    async registrarMovimiento(cajaId, data, usuarioId) {
        const montoCentavos = escalar(data.monto, 2, 'monto');
        if (montoCentavos === 0n) {
            throw new HttpError(400, 'El monto del movimiento debe ser mayor que cero');
        }
        validarImporte(montoCentavos);

        return sequelize.transaction(async (transaction) => {
            const caja = await models.Caja.findByPk(cajaId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!caja) {
                throw new HttpError(404, `La caja con ID ${cajaId} no existe`);
            }
            if (caja.estado !== 'abierta') {
                throw new HttpError(400, 'No se pueden registrar movimientos en una caja cerrada');
            }

            return models.MovimientoCaja.create(
                {
                    cajaId: caja.id,
                    tipo: data.tipo, // 'ingreso' | 'egreso'
                    monto: centavosATexto(montoCentavos),
                    descripcion: data.descripcion.trim(),
                    usuarioId,
                },
                { transaction }
            );
        });
    }

    async cerrar(cajaId, data, usuarioId) {
        const efectivoRealCentavos = escalar(data.efectivoReal, 2, 'efectivoReal');
        validarImporte(efectivoRealCentavos);

        const idCerrada = await sequelize.transaction(async (transaction) => {
            const caja = await models.Caja.findByPk(cajaId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!caja) {
                throw new HttpError(404, `La caja con ID ${cajaId} no existe`);
            }
            if (caja.estado !== 'abierta') {
                throw new HttpError(400, 'Esta caja ya se encuentra cerrada');
            }

            // 1. Obtener todas las ventas válidas (no anuladas) de esta caja con sus pagos
            const ventas = await models.Venta.findAll({
                where: {
                    cajaId: caja.id,
                    estado: { [Op.ne]: 'anulada' },
                },
                include: [
                    {
                        association: 'pagos',
                        include: [{ association: 'metodoPago', attributes: ['id', 'nombre', 'esEfectivo'] }],
                    },
                ],
                transaction,
            });

            let ventasEfectivo = 0n;
            let tarjetaTotal = 0n;
            let digitalTotal = 0n;

            for (const venta of ventas) {
                for (const pago of venta.pagos) {
                    const montoPago = escalarDesdeBd(pago.monto, 2);
                    const nombreMetodo = (pago.metodoPago?.nombre || '').toLowerCase();

                    if (pago.metodoPago?.esEfectivo) {
                        ventasEfectivo += montoPago;
                    } else if (nombreMetodo.includes('tarjeta')) {
                        tarjetaTotal += montoPago;
                    } else {
                        // Transferencias, QR, billeteras digitales, etc.
                        digitalTotal += montoPago;
                    }
                }
            }

            // 2. Sumar ingresos y egresos de caja chica
            const movimientos = await models.MovimientoCaja.findAll({
                where: { cajaId: caja.id },
                transaction,
            });

            let ingresosCaja = 0n;
            let egresosCaja = 0n;

            for (const mov of movimientos) {
                const montoMov = escalarDesdeBd(mov.monto, 2);
                if (mov.tipo === 'ingreso') {
                    ingresosCaja += montoMov;
                } else {
                    egresosCaja += montoMov;
                }
            }

            // 3. Arqueo final
            const montoInicial = escalarDesdeBd(caja.montoInicial, 2);
            const efectivoEsperado = montoInicial + ventasEfectivo + ingresosCaja - egresosCaja;
            const diferencia = efectivoRealCentavos - efectivoEsperado;

            await caja.update(
                {
                    usuarioCierreId: usuarioId,
                    fechaCierre: new Date(),
                    efectivoEsperado: centavosConSignoATexto(efectivoEsperado),
                    efectivoReal: centavosATexto(efectivoRealCentavos),
                    tarjetaTotal: centavosATexto(tarjetaTotal),
                    digitalTotal: centavosATexto(digitalTotal),
                    diferencia: centavosConSignoATexto(diferencia),
                    observaciones: data.observaciones ?? caja.observaciones,
                    estado: 'cerrada',
                },
                { transaction }
            );

            return caja.id;
        });

        return this.findOne(idCerrada);
    }
}

module.exports = { CajaService };