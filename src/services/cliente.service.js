const { Op } = require('sequelize');
const { models } = require('../db/config.db');

class ClienteService {
    async findAll(query = {}) {
        const { limit, offset, search } = query;

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

        if (search) {
            options.where.nombre = {
                [Op.iLike]: `%${search}%`,
            };
        }

        return await models.Cliente.findAll(options);
    }

    async findOne(id) {
        const cliente = await models.Cliente.findByPk(id);

        if (!cliente) {
            const error = new Error('El cliente no existe');
            error.statusCode = 404;
            throw error;
        }

        return cliente;
    }

    async create(data) {
        return await models.Cliente.create(data);
    }

    async update(id, data) {
        const cliente = await this.findOne(id);
        return await cliente.update(data);
    }
}

module.exports = { ClienteService };
