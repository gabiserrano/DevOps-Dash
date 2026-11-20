const { Op, Sequelize } = require('sequelize');
const sequelize = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');
const {
    escalar,
    escalarDesdeBd,
    cantidadATexto,
} = require('../helpers/math.helper');

const { models } = sequelize;

class InventarioService {
    async findAll(query = {}) {
        const { limit, offset, sucursalId, insumoId, bajoStock, search } = query;

        const options = {
            where: {},
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre'] },
                {
                    association: 'insumo',
                    attributes: ['id', 'nombre', 'unidad', 'costoPromedio', 'activo'],
                    where: {},
                },
            ],
            order: [['id', 'ASC']],
        };

        if (limit !== undefined) options.limit = Number(limit);
        if (offset !== undefined) options.offset = Number(offset);
        if (sucursalId !== undefined) options.where.sucursalId = sucursalId;
        if (insumoId !== undefined) options.where.insumoId = insumoId;

        if (String(bajoStock) === 'true') {
            options.where.stockActual = {
                [Op.lte]: Sequelize.col('Inventario.stock_minimo'),
            };
        }

        if (search) {
            options.include[1].where.nombre = {
                [Op.iLike]: `%${search}%`,
            };
        }

        return models.Inventario.findAll(options);
    }

    async findOne(id) {
        const inventario = await models.Inventario.findByPk(id, {
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre'] },
                { association: 'insumo', attributes: ['id', 'nombre', 'unidad', 'costoPromedio', 'activo'] },
            ],
        });

        if (!inventario) {
            throw new HttpError(404, `El registro de inventario con ID ${id} no existe`);
        }

        return inventario;
    }

    async updateStockMinimo(id, data) {
        const stockMinimoEscalado = escalar(data.stockMinimo, 3, 'stockMinimo');
        const inventario = await this.findOne(id);

        await inventario.update({
            stockMinimo: cantidadATexto(stockMinimoEscalado),
        });

        return this.findOne(id);
    }

    async registrarAjuste(data, usuarioId) {
        const cantidadEscalada = escalar(data.cantidad, 3, 'cantidad');
        if (cantidadEscalada === 0n) {
            throw new HttpError(400, 'La cantidad del ajuste debe ser mayor que cero');
        }

        const inventarioId = await sequelize.transaction(async (transaction) => {
            const [sucursal, insumo] = await Promise.all([
                models.Sucursal.findByPk(data.sucursalId, { transaction }),
                models.Insumo.findByPk(data.insumoId, { transaction }),
            ]);

            if (!sucursal || !sucursal.activa) {
                throw new HttpError(400, 'La sucursal no existe o está inactiva');
            }
            if (!insumo || !insumo.activo) {
                throw new HttpError(400, 'El insumo no existe o está inactivo');
            }

            const [inventario] = await models.Inventario.findOrCreate({
                where: {
                    sucursalId: data.sucursalId,
                    insumoId: data.insumoId,
                },
                defaults: {
                    sucursalId: data.sucursalId,
                    insumoId: data.insumoId,
                    stockActual: '0.000',
                    stockMinimo: '0.000',
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            const stockActual = escalarDesdeBd(inventario.stockActual, 3);
            let nuevoStock;

            if (data.tipo === 'entrada') {
                nuevoStock = stockActual + cantidadEscalada;
            } else if (data.tipo === 'salida') {
                if (stockActual < cantidadEscalada) {
                    throw new HttpError(
                        400,
                        `Stock insuficiente para realizar la salida del insumo "${insumo.nombre}"`
                    );
                }
                nuevoStock = stockActual - cantidadEscalada;
            } else {
                throw new HttpError(400, 'El tipo de ajuste debe ser "entrada" o "salida"');
            }

            await inventario.update(
                { stockActual: cantidadATexto(nuevoStock) },
                { transaction }
            );

            await models.MovimientoInventario.create(
                {
                    sucursalId: data.sucursalId,
                    insumoId: data.insumoId,
                    tipo: data.tipo,
                    cantidad: cantidadATexto(cantidadEscalada),
                    motivo: data.motivo || 'ajuste',
                    referenciaId: null,
                    usuarioId,
                },
                { transaction }
            );

            return inventario.id;
        });

        return this.findOne(inventarioId);
    }

    async findMovimientos(query = {}) {
        const {
            limit,
            offset,
            sucursalId,
            insumoId,
            tipo,
            motivo,
            fechaInicio,
            fechaFin,
        } = query;

        const options = {
            where: {},
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre'] },
                { association: 'insumo', attributes: ['id', 'nombre', 'unidad'] },
                { association: 'usuario', attributes: ['id', 'nombre', 'email'] },
            ],
            order: [['id', 'DESC']],
        };

        if (limit !== undefined) options.limit = Number(limit);
        if (offset !== undefined) options.offset = Number(offset);
        if (sucursalId !== undefined) options.where.sucursalId = sucursalId;
        if (insumoId !== undefined) options.where.insumoId = insumoId;
        if (tipo) options.where.tipo = tipo;
        if (motivo) options.where.motivo = motivo;

        if (fechaInicio || fechaFin) {
            options.where.createdAt = {};
            if (fechaInicio) options.where.createdAt[Op.gte] = fechaInicio;
            if (fechaFin) options.where.createdAt[Op.lte] = fechaFin;
        }

        return models.MovimientoInventario.findAll(options);
    }
}

module.exports = { InventarioService };