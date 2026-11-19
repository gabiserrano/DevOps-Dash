const { Op } = require('sequelize');
const { models } = require('../db/config.db');

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
            ],
            order: [['id', 'DESC']],
        };

        if (limit !== undefined) {
            options.limit = limit;
        }

        if (offset !== undefined) {
            options.offset = offset;
        }

        if (sucursalId !== undefined) {
            options.where.sucursalId = sucursalId;
        }

        if (cajaId !== undefined) {
            options.where.cajaId = cajaId;
        }

        if (usuarioId !== undefined) {
            options.where.usuarioId = usuarioId;
        }

        if (clienteId !== undefined) {
            options.where.clienteId = clienteId;
        }

        if (tipoDoc) {
            options.where.tipoDoc = tipoDoc;
        }

        if (estado) {
            options.where.estado = estado;
        }

        if (fechaInicio || fechaFin) {
            options.where.fecha = {};

            if (fechaInicio) {
                options.where.fecha[Op.gte] = fechaInicio;
            }

            if (fechaFin) {
                options.where.fecha[Op.lte] = fechaFin;
            }
        }

        const ventas = await models.Venta.findAll(options);
        return ventas;
    }

    
    async findOne(id) {
        const venta = await models.Venta.findByPk(id, {
            include: [
                { association: 'detalles' },
                { association: 'pagos' },
            ],
        });

        if (!venta) {
            const error = new Error(`La venta con ID ${id} no existe`);
            error.statusCode = 404;
            throw error;
        }

        return venta;
    }

    
    async create(data) {
        const sequelize = models.Venta.sequelize;

        const errorValidacion = (mensaje) => {
            const error = new Error(mensaje);
            error.statusCode = 400;
            return error;
        };

        
        const centavos = (valor) => Math.round(Number(valor) * 100);

        
        const subtotalDetalles = data.detalles.reduce(
            (suma, detalle) => {
                const esperado =
                    centavos(detalle.precioUnitario) * detalle.cantidad;

                if (centavos(detalle.subtotal) !== esperado) {
                    throw errorValidacion(
                        'El subtotal de un detalle no coincide con su cantidad y precio'
                    );
                }

                return suma + esperado;
            },
            0
        );

        const subtotal = centavos(data.subtotal);
        const iva = centavos(data.iva);
        const total = centavos(data.total);

        
        if (subtotalDetalles !== subtotal) {
            throw errorValidacion(
                'El subtotal de la venta no coincide con sus detalles'
            );
        }

        
        if (subtotal + iva !== total) {
            throw errorValidacion(
                'El total debe ser igual al subtotal más el IVA'
            );
        }

        
        const totalPagos = data.pagos.reduce(
            (suma, pago) => suma + centavos(pago.monto),
            0
        );

        if (totalPagos !== total) {
            throw errorValidacion(
                'La suma de los pagos debe coincidir con el total de la venta'
            );
        }

        
        return sequelize.transaction(async (transaction) => {
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
                const error = new Error(
                    'No existe un correlativo configurado para esta sucursal, documento y serie'
                );
                error.statusCode = 404;
                throw error;
            }

            
            const numeroDoc = correlativo.ultimoNumero + 1;

            
            await correlativo.update(
                { ultimoNumero: numeroDoc },
                { transaction }
            );

            
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

            
            const detalles = data.detalles.map((detalle) => ({
                ...detalle,
                ventaId: venta.id,
            }));

            
            await models.VentaDetalle.bulkCreate(detalles, {
                transaction,
                validate: true,
            });

            
            const pagos = data.pagos.map((pago) => ({
                ...pago,
                ventaId: venta.id,
            }));

            
            await models.VentaPago.bulkCreate(pagos, {
                transaction,
                validate: true,
            });

            
            return models.Venta.findByPk(venta.id, {
                include: [
                    { association: 'detalles' },
                    { association: 'pagos' },
                ],
                transaction,
            });
        });
    }
}

module.exports = { VentaService };

