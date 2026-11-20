const { Op } = require('sequelize');
const { models } = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');

class RolService {

    async findAll({ limit, offset, search } = {}) {
        const options = {
            order: [['id', 'ASC']]
        };

        if (limit !== undefined) {
            options.limit = Number(limit);
        }

        if (offset !== undefined) {
            options.offset = Number(offset);
        }

        if (search) {
            options.where = {
                nombre: { [Op.iLike]: `%${search}%` }
            };
        }

        return models.Rol.findAll(options);
    }

    async findOne(id) {
        const rol = await models.Rol.findByPk(id);

        if (!rol) {
            throw new HttpError(404, `El rol con ID ${id} no existe`);
        }

        return rol;
    }

    async create(data) {
        const existente = await models.Rol.findOne({
            where: { nombre: data.nombre }
        });

        if (existente) {
            throw new HttpError(409, 'Ya existe un rol con ese nombre');
        }

        return models.Rol.create(data);
    }

    async update(id, data) {
        const rol = await this.findOne(id);

        if (data.nombre && data.nombre !== rol.nombre) {
            const existente = await models.Rol.findOne({
                where: { nombre: data.nombre }
            });

            if (existente) {
                throw new HttpError(409, 'Ya existe un rol con ese nombre');
            }
        }

        return rol.update(data);
    }
}

module.exports = { RolService };
