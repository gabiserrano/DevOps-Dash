
const { Op } = require('sequelize');
const { models } = require('../db/config.db');

class InsumoService {

    async findAll(query = {}) {
        const { limit, offset, activo, search } = query;

        const options = {
            where: {},
            order: [['id', 'ASC']],
        };

        if (limit !== undefined) {
            options.limit = Number(limit);
        }

        if (offset !== undefined) {
            options.offset = Number(offset);
        }

        if (activo !== undefined) {
            options.where.activo = activo === true || activo === 'true';
        }

        if (search) {
            options.where.nombre = {
                [Op.iLike]: `%${search}%`,
            };
        }

        return await models.Insumo.findAll(options);
    }

    // GET /:id - Obtener insumo por ID
    async findOne(id) {
        const insumo = await models.Insumo.findByPk(id);

        if (!insumo) {
            const error = new Error(`El insumo con ID ${id} no existe`);
            error.statusCode = 404;
            throw error;
        }

        return insumo;
    }

    async create(data) {
        const nuevoInsumo = await models.Insumo.create({
            nombre: data.nombre,
            unidad: data.unidad,
            costoPromedio: data.costoPromedio ?? 0,
            activo: data.activo ?? true,
        });

        return nuevoInsumo;
    }

    async update(id, changes) {
        const insumo = await this.findOne(id);

        const camposPermitidos = [
            'nombre',
            'unidad',
            'costoPromedio',
            'activo',
        ];

        const datosActualizar = {};

        for (const campo of camposPermitidos) {
            if (changes[campo] !== undefined) {
                datosActualizar[campo] = changes[campo];
            }
        }

        if (Object.keys(datosActualizar).length === 0) {
            const error = new Error('Debes enviar al menos un campo para actualizar');
            error.statusCode = 400;
            throw error;
        }

        await insumo.update(datosActualizar);

        return insumo;
    }
}

module.exports = { InsumoService };
