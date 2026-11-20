const { Op } = require('sequelize');
const { models } = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');

class ProductoService {
    async findAll(query = {}) {
        const { limit, offset, categoria, tipo, activo, search } = query;

        const options = {
            where: {},
            include: [
                {
                    association: 'insumo',
                    attributes: ['id', 'nombre', 'unidad', 'costoPromedio'],
                },
            ],
            order: [['id', 'ASC']],
        };

        if (limit !== undefined) options.limit = Number(limit);
        if (offset !== undefined) options.offset = Number(offset);
        if (categoria) options.where.categoria = categoria;
        if (tipo) options.where.tipo = tipo;
        if (activo !== undefined) options.where.activo = activo;
        if (search) {
            options.where.nombre = {
                [Op.iLike]: `%${search}%`,
            };
        }

        return models.Producto.findAll(options);
    }

    async findOne(id) {
        const producto = await models.Producto.findByPk(id, {
            include: [
                {
                    association: 'insumo',
                    attributes: ['id', 'nombre', 'unidad', 'costoPromedio'],
                },
                {
                    association: 'receta',
                    include: [
                        {
                            association: 'insumo',
                            attributes: ['id', 'nombre', 'unidad', 'costoPromedio'],
                        },
                    ],
                },
            ],
        });

        if (!producto) {
            throw new HttpError(404, `El producto con ID ${id} no existe`);
        }

        return producto;
    }

    async create(data) {
        if (data.tipo === 'reventa') {
            const insumo = await models.Insumo.findByPk(data.insumoId);
            if (!insumo) {
                throw new HttpError(404, `El insumo con ID ${data.insumoId} no existe`);
            }
        } else {
            data.insumoId = null;
        }

        const nuevoProducto = await models.Producto.create(data);
        return this.findOne(nuevoProducto.id);
    }

    async update(id, changes) {
        const producto = await this.findOne(id);

        const tipoFinal = changes.tipo ?? producto.tipo;
        const insumoFinal = changes.insumoId !== undefined ? changes.insumoId : producto.insumoId;

        if (tipoFinal === 'reventa') {
            if (!insumoFinal) {
                throw new HttpError(400, 'El insumoId es obligatorio para productos de tipo reventa');
            }
            const insumo = await models.Insumo.findByPk(insumoFinal);
            if (!insumo) {
                throw new HttpError(404, `El insumo con ID ${insumoFinal} no existe`);
            }
        } else {
            // Si pasa a ser elaborado, nos aseguramos de limpiar insumoId
            changes.insumoId = null;
        }

        await producto.update(changes);
        return this.findOne(id);
    }
}

module.exports = { ProductoService };