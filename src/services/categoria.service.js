const { Op } = require('sequelize');
const { models } = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');

class CategoriaService {
    async findAll(query = {}) {
        const { search } = query;
        const where = {};

        if (search) {
            where.nombre = { [Op.iLike]: `%${search}%` };
        }

        return models.Categoria.findAll({ where, order: [['nombre', 'ASC']] });
    }

    async create(data) {
        const nombre = data.nombre.trim();
        const existente = await models.Categoria.findOne({ where: { nombre } });

        if (existente) {
            throw new HttpError(409, `La categoría "${nombre}" ya existe`);
        }

        return models.Categoria.create({ nombre });
    }

    async update(id, data) {
        const categoria = await models.Categoria.findByPk(id);
        if (!categoria) {
            throw new HttpError(404, `La categoría con ID ${id} no existe`);
        }

        const nombre = data.nombre.trim();
        const duplicada = await models.Categoria.findOne({
            where: { nombre, id: { [Op.ne]: id } },
        });

        if (duplicada) {
            throw new HttpError(409, `La categoría "${nombre}" ya existe`);
        }

        const anterior = categoria.nombre;

        await models.sequelize.transaction(async (transaction) => {
            await categoria.update({ nombre }, { transaction });

            // Productos e insumos guardan la categoría por nombre: se renombran en bloque.
            await models.Producto.update(
                { categoria: nombre },
                { where: { categoria: anterior }, transaction },
            );
            await models.Insumo.update(
                { categoria: nombre },
                { where: { categoria: anterior }, transaction },
            );
        });

        return categoria;
    }

    async delete(id) {
        const categoria = await models.Categoria.findByPk(id);
        if (!categoria) {
            throw new HttpError(404, `La categoría con ID ${id} no existe`);
        }

        const enUsoProductos = await models.Producto.count({ where: { categoria: categoria.nombre } });
        const enUsoInsumos = await models.Insumo.count({ where: { categoria: categoria.nombre } });
        const enUso = enUsoProductos + enUsoInsumos;

        if (enUso > 0) {
            throw new HttpError(
                409,
                `No se puede eliminar: ${enUso} registro(s) usan la categoría "${categoria.nombre}"`,
            );
        }

        await categoria.destroy();
        return { message: 'Categoría eliminada correctamente' };
    }
}

module.exports = { CategoriaService };
