const { Op } = require('sequelize');
const { models } = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');
const { hashPassword } = require('../helpers/password.helper');

const associations = [
    { association: 'rol', attributes: ['id', 'nombre'] },
    { association: 'sucursal', attributes: ['id', 'nombre'] },
    { association: 'empleado', attributes: ['id', 'nombres', 'apellidos', 'puesto'] },
];

const safeAttributes = {
    exclude: ['passwordHash']
};

class UsuarioService {

    async findAll({ limit, offset, sucursalId, rolId, activo } = {}) {
        const where = {};

        if (sucursalId !== undefined) {
            where.sucursalId = sucursalId;
        }

        if (rolId !== undefined) {
            where.rolId = rolId;
        }

        if (activo !== undefined) {
            where.activo = activo;
        }

        const options = {
            where,
            attributes: safeAttributes,
            include: associations,
            order: [['id', 'ASC']]
        };

        if (limit !== undefined) {
            options.limit = Number(limit);
        }

        if (offset !== undefined) {
            options.offset = Number(offset);
        }

        return models.Usuario.findAll(options);
    }

    async findOne(id) {
        const usuario = await models.Usuario.findByPk(id, {
            attributes: safeAttributes,
            include: associations,
        });

        if (!usuario) {
            throw new HttpError(404, `El usuario con ID ${id} no existe`);
        }

        return usuario;
    }

    async validateRelations(data) {
        if (
            data.rolId !== undefined &&
            !await models.Rol.findByPk(data.rolId)
        ) {
            throw new HttpError(404, `El rol ${data.rolId} no existe`);
        }

        if (
            data.sucursalId !== undefined &&
            !await models.Sucursal.findByPk(data.sucursalId)
        ) {
            throw new HttpError(404, `La sucursal ${data.sucursalId} no existe`);
        }

        if (
            data.empleadoId != null &&
            !await models.Empleado.findByPk(data.empleadoId)
        ) {
            throw new HttpError(404, `El empleado ${data.empleadoId} no existe`);
        }
    }

    async create(data) {
        await this.validateRelations(data);

        if (await models.Usuario.findOne({
            where: { email: data.email }
        })) {
            throw new HttpError(409, 'El correo ya está registrado');
        }

        const { password, ...fields } = data;

        const passwordHash = await hashPassword(password);

        const usuario = await models.Usuario.create({
            ...fields,
            passwordHash
        });

        return this.findOne(usuario.id);
    }

    async update(id, data) {
        const usuario = await models.Usuario.findByPk(id);

        if (!usuario) {
            throw new HttpError(404, `El usuario con ID ${id} no existe`);
        }

        await this.validateRelations(data);

        if (data.email && data.email !== usuario.email) {
            const existe = await models.Usuario.findOne({
                where: {
                    email: data.email,
                    id: { [Op.ne]: id }
                }
            });

            if (existe) {
                throw new HttpError(409, 'El correo ya está registrado');
            }
        }

        const { password, ...changes } = data;

        if (password !== undefined) {
            changes.passwordHash = await hashPassword(password);
        }

        await usuario.update(changes);

        return this.findOne(id);
    }
}

module.exports = { UsuarioService };
