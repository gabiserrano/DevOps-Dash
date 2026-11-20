
const { Op } = require('sequelize');
const { models } = require('../db/config.db');

const includeProveedores = {
    association: 'proveedores',
    attributes: ['id', 'nombre'],
    through: { attributes: [] },
    required: false,
};

class InsumoService {

    async findAll(query = {}) {
        const { limit, offset, activo, search } = query;

        const options = {
            where: {},
            include: [includeProveedores],
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
            options.where[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { sku: { [Op.iLike]: `%${search}%` } },
            ];
        }

        return await models.Insumo.findAll(options);
    }

    // GET /:id - Obtener insumo por ID
    async findOne(id) {
        const insumo = await models.Insumo.findByPk(id, { include: [includeProveedores] });

        if (!insumo) {
            const error = new Error(`El insumo con ID ${id} no existe`);
            error.statusCode = 404;
            throw error;
        }

        return insumo;
    }

    async create(data) {
        const { proveedorIds, ...campos } = data;

        const nuevoInsumo = await models.Insumo.create({
            nombre: campos.nombre,
            sku: campos.sku || null,
            categoria: campos.categoria || null,
            unidad: campos.unidad,
            costoPromedio: campos.costoPromedio ?? 0,
            activo: campos.activo ?? true,
        });

        if (Array.isArray(proveedorIds)) {
            await nuevoInsumo.setProveedores(proveedorIds);
        }

        return this.findOne(nuevoInsumo.id);
    }

    async update(id, changes) {
        const insumo = await this.findOne(id);

        const camposPermitidos = [
            'nombre',
            'sku',
            'categoria',
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

        if (Object.keys(datosActualizar).length === 0 && !Array.isArray(changes.proveedorIds)) {
            const error = new Error('Debes enviar al menos un campo para actualizar');
            error.statusCode = 400;
            throw error;
        }

        await insumo.update(datosActualizar);

        if (Array.isArray(changes.proveedorIds)) {
            await insumo.setProveedores(changes.proveedorIds);
        }

        return this.findOne(id);
    }
}

module.exports = { InsumoService };
