const { Op } = require('sequelize');
const { models } = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');

class ProveedorService {
    async findAll(query = {}) {
        const { limit, offset, activo, search } = query;

        const options = {
            where: {},
            order: [['id', 'ASC']],
        };

        if (limit !== undefined) options.limit = Number(limit);
        if (offset !== undefined) options.offset = Number(offset);
        if (activo !== undefined) options.where.activo = activo;

        if (search) {
            options.where[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { nit: { [Op.iLike]: `%${search}%` } },
            ];
        }

        return models.Proveedor.findAll(options);
    }

    async findOne(id) {
        const proveedor = await models.Proveedor.findByPk(id, {
            include: [
                {
                    association: 'cuentasPorPagar',
                    where: { estado: { [Op.in]: ['pendiente', 'parcial'] } },
                    required: false,
                },
            ],
        });

        if (!proveedor) {
            throw new HttpError(404, `El proveedor con ID ${id} no existe`);
        }

        return proveedor;
    }

    async create(data) {
        const nuevoProveedor = await models.Proveedor.create(data);
        return this.findOne(nuevoProveedor.id);
    }

    async update(id, changes) {
        const proveedor = await this.findOne(id);
        await proveedor.update(changes);
        return this.findOne(id);
    }
}

module.exports = { ProveedorService };