const { Op } = require('sequelize');
const sequelize = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');
const { escalar, validarImporte } = require('../helpers/math.helper');
const {
    calcularConsumoVenta,
    descontarSalidaVenta,
    devolverStockAnulacion,
} = require('../helpers/inventario.helper');

const { models } = sequelize;

class VentaService {
    async findAll(query = {}) {
        const {
            limit,
            offset,
            sucursalId,
            cajaId,
            usuarioId,
            clienteId,
            tipoDoc,
            estado,
            fechaInicio,
            fechaFin,
        } = query;

        const options = {
            where: {},
            include: [
                { association: 'detalles' },
                { association: 'pagos' },
                { association: 'cliente', attributes: ['id', 'nombre', 'nit', 'nrc'] },
            ],
            order: [['id', 'DESC']],
        };

        if (limit !== undefined) options.limit = Number(limit);
        if (offset !== undefined) options.offset = Number(offset);
        if (sucursalId !== undefined) options.where.sucursalId = sucursalId;
        if (cajaId !== undefined) options.where.cajaId = cajaId;
        if (usuarioId !== undefined) options.where.usuarioId = usuarioId;
        if (clienteId !== undefined) options.where.clienteId = clienteId;
        if (tipoDoc) options.where.tipoDoc = tipoDoc;
        if (estado) options.where.estado = estado;

        if (fechaInicio || fechaFin) {
            options.where.fecha = {};
            if (fechaInicio) options.where.fecha[Op.gte] = fechaInicio;
            if (fechaFin) options.where.fecha[Op.lte] = fechaFin;
        }

        return models.Venta.findAll(options);
    }

    async findOne(id) {
        const venta = await models.Venta.findByPk(id, {
            include: [
                {
                    association: 'detalles',
                    include: [{ association: 'producto', attributes: ['id', 'nombre', 'tipo'] }],
                },
                {
                    association: 'pagos',
                    include: [{ association: 'metodoPago', attributes: ['id', 'nombre', 'esEfectivo'] }],
                },
                { association: 'cliente' },
                { association: 'sucursal', attributes: ['id', 'nombre'] },
            ],
        });

        if (!venta) {
            throw new HttpError(404, `La venta con ID ${id} no existe`);
        }

        return venta;
    }

    async create(data) {
        const subtotalDetalles = data.detalles.reduce((suma, detalle, i) => {
            const precioCentavos = escalar(detalle.precioUnitario, 2, `detalles[${i}].precioUnitario`);
            const subtotalEnviado = escalar(detalle.subtotal, 2, `detalles[${i}].subtotal`);
            const esperado = precioCentavos * BigInt(detalle.cantidad);

            if (subtotalEnviado !== esperado) {
                throw new HttpError(400, `detalles[${i}].subtotal no coincide con su cantidad y precio`);
            }
            return suma + esperado;
        }, 0n);

        const subtotal = escalar(data.subtotal, 2, 'subtotal');
        const iva = escalar(data.iva, 2, 'iva');
        const total = escalar(data.total, 2, 'total');

        [subtotal, iva, total].forEach(validarImporte);

        if (subtotalDetalles !== subtotal) {
            throw new HttpError(400, 'El subtotal de la venta no coincide con sus detalles');
        }
        if (subtotal + iva !== total) {
            throw new HttpError(400, 'El total debe ser igual al subtotal más el IVA');
        }

        const totalPagos = data.pagos.reduce(
            (suma, pago, i) => suma + escalar(pago.monto, 2, `pagos[${i}].monto`),
            0n
        );

        if (totalPagos !== total) {
            throw new HttpError(400, 'La suma de los pagos debe coincidir con el total de la venta');
        }

        if (data.tipoDoc === 'CCF' && !data.clienteId) {
            throw new HttpError(400, 'El cliente es obligatorio para emitir un CCF');
        }

        const ventaId = await sequelize.transaction(async (transaction) => {
            const caja = await models.Caja.findByPk(data.cajaId, { transaction });
            if (!caja || caja.estado !== 'abierta') {
                throw new HttpError(400, 'La caja no existe o ya se encuentra cerrada');
            }
            if (Number(caja.sucursalId) !== Number(data.sucursalId)) {
                throw new HttpError(400, 'La caja no pertenece a la sucursal indicada');
            }

            if (data.clienteId) {
                const cliente = await models.Cliente.findByPk(data.clienteId, { transaction });
                if (!cliente) {
                    throw new HttpError(404, `El cliente con ID ${data.clienteId} no existe`);
                }
            }

            const consumoPorInsumo = await calcularConsumoVenta(models, data.detalles, transaction);

            const serie = data.serie || 'A';
            const correlativo = await models.Correlativo.findOne({
                where: {
                    sucursalId: data.sucursalId,
                    tipoDoc: data.tipoDoc,
                    serie,
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!correlativo) {
                throw new HttpError(404, 'No existe un correlativo configurado para esta sucursal, documento y serie');
            }

            const numeroDoc = correlativo.ultimoNumero + 1;
            await correlativo.update({ ultimoNumero: numeroDoc }, { transaction });

            const venta = await models.Venta.create(
                {
                    sucursalId: data.sucursalId,
                    cajaId: data.cajaId,
                    usuarioId: data.usuarioId,
                    clienteId: data.clienteId ?? null,
                    tipoDoc: data.tipoDoc,
                    serie,
                    numeroDoc,
                    subtotal: data.subtotal,
                    iva: data.iva,
                    total: data.total,
                },
                { transaction }
            );

            await models.VentaDetalle.bulkCreate(
                data.detalles.map((d) => ({ ...d, ventaId: venta.id })),
                { transaction, validate: true }
            );

            await models.VentaPago.bulkCreate(
                data.pagos.map((p) => ({ ...p, ventaId: venta.id })),
                { transaction, validate: true }
            );

            await descontarSalidaVenta(
                models,
                {
                    sucursalId: data.sucursalId,
                    consumoPorInsumo,
                    ventaId: venta.id,
                    usuarioId: data.usuarioId,
                },
                transaction
            );

            return venta.id;
        });

        return this.findOne(ventaId);
    }

    async anular(id, usuarioId = null) {
        return sequelize.transaction(async (transaction) => {
            const venta = await models.Venta.findByPk(id, {
                include: [{ association: 'detalles' }],
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!venta) {
                throw new HttpError(404, `La venta con ID ${id} no existe`);
            }
            if (venta.estado === 'anulada') {
                throw new HttpError(400, 'La venta ya se encuentra anulada');
            }

            const consumoPorInsumo = await calcularConsumoVenta(models, venta.detalles, transaction);

            await devolverStockAnulacion(
                models,
                {
                    sucursalId: venta.sucursalId,
                    consumoPorInsumo,
                    ventaId: venta.id,
                    usuarioId: usuarioId ?? venta.usuarioId,
                },
                transaction
            );

            await venta.update({ estado: 'anulada' }, { transaction });
            return this.findOne(venta.id);
        });
    }
}

module.exports = { VentaService };
