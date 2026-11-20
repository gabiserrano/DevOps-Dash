const { Op } = require('sequelize');
const { models } = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');
const {
    escalar,
    centavosATexto,
    validarImporte,
} = require('../helpers/math.helper');

class EmpleadoService {
    async findAll(query = {}) {
        const { limit, offset, sucursalId, puesto, activo, search } = query;

        const options = {
            where: {},
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre'] },
            ],
            order: [['id', 'ASC']],
        };

        if (limit !== undefined) options.limit = Number(limit);
        if (offset !== undefined) options.offset = Number(offset);
        if (sucursalId !== undefined) options.where.sucursalId = sucursalId;
        if (puesto) options.where.puesto = puesto;
        if (activo !== undefined) options.where.activo = activo;

        if (search) {
            options.where[Op.or] = [
                { nombres: { [Op.iLike]: `%${search}%` } },
                { apellidos: { [Op.iLike]: `%${search}%` } },
                { dui: { [Op.iLike]: `%${search}%` } },
            ];
        }

        return models.Empleado.findAll(options);
    }

    async findOne(id) {
        const empleado = await models.Empleado.findByPk(id, {
            include: [
                { association: 'sucursal', attributes: ['id', 'nombre', 'activa'] },
                {
                    association: 'usuario',
                    attributes: ['id', 'nombre', 'email', 'activo', 'rolId'],
                    required: false,
                },
            ],
        });

        if (!empleado) {
            throw new HttpError(404, `El empleado con ID ${id} no existe`);
        }

        return empleado;
    }

    async create(data) {
        const salarioCentavos = escalar(data.salarioMensual, 2, 'salarioMensual');
        if (salarioCentavos === 0n) {
            throw new HttpError(400, 'El salario mensual debe ser mayor que cero');
        }
        validarImporte(salarioCentavos);

        const sucursal = await models.Sucursal.findByPk(data.sucursalId);
        if (!sucursal || !sucursal.activa) {
            throw new HttpError(400, 'La sucursal indicada no existe o está inactiva');
        }

        const duiExistente = await models.Empleado.findOne({
            where: { dui: data.dui.trim() },
        });
        if (duiExistente) {
            throw new HttpError(409, `Ya existe un empleado registrado con el DUI ${data.dui}`);
        }

        if (data.correo) {
            const correoExistente = await models.Empleado.findOne({
                where: { correo: data.correo.trim().toLowerCase() },
            });
            if (correoExistente) {
                throw new HttpError(409, `Ya existe un empleado registrado con el correo ${data.correo}`);
            }
        }

        const nuevoEmpleado = await models.Empleado.create({
            ...data,
            nombres: data.nombres.trim(),
            apellidos: data.apellidos.trim(),
            dui: data.dui.trim(),
            correo: data.correo ? data.correo.trim().toLowerCase() : null,
            salarioMensual: centavosATexto(salarioCentavos),
        });

        return this.findOne(nuevoEmpleado.id);
    }

    async update(id, changes) {
        const empleado = await this.findOne(id);
        const payload = { ...changes };

        if (payload.sucursalId !== undefined) {
            const sucursal = await models.Sucursal.findByPk(payload.sucursalId);
            if (!sucursal || !sucursal.activa) {
                throw new HttpError(400, 'La sucursal indicada no existe o está inactiva');
            }
        }

        if (payload.dui !== undefined) {
            const duiLimpio = payload.dui.trim();
            const duiExistente = await models.Empleado.findOne({
                where: {
                    dui: duiLimpio,
                    id: { [Op.ne]: id },
                },
            });
            if (duiExistente) {
                throw new HttpError(409, `Ya existe otro empleado registrado con el DUI ${duiLimpio}`);
            }
            payload.dui = duiLimpio;
        }

        if (payload.correo !== undefined && payload.correo !== null) {
            const correoLimpio = payload.correo.trim().toLowerCase();
            const correoExistente = await models.Empleado.findOne({
                where: {
                    correo: correoLimpio,
                    id: { [Op.ne]: id },
                },
            });
            if (correoExistente) {
                throw new HttpError(409, `Ya existe otro empleado registrado con el correo ${correoLimpio}`);
            }
            payload.correo = correoLimpio;
        }

        if (payload.salarioMensual !== undefined) {
            const salarioCentavos = escalar(payload.salarioMensual, 2, 'salarioMensual');
            if (salarioCentavos === 0n) {
                throw new HttpError(400, 'El salario mensual debe ser mayor que cero');
            }
            validarImporte(salarioCentavos);
            payload.salarioMensual = centavosATexto(salarioCentavos);
        }

        if (payload.nombres !== undefined) payload.nombres = payload.nombres.trim();
        if (payload.apellidos !== undefined) payload.apellidos = payload.apellidos.trim();

        await empleado.update(payload);
        return this.findOne(id);
    }
}

module.exports = { EmpleadoService };