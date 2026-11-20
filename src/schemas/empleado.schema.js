const joi = require('joi');

const id = joi.number().integer().positive();
const sucursalId = joi.number().integer().positive();
const nombres = joi.string().min(2).max(100);
const apellidos = joi.string().min(2).max(100);
const dui = joi.string().pattern(/^\d{8}-\d$/).max(10).allow(null, '');
const nit = joi.string().max(17).allow(null, '');
const puesto = joi.string().valid('barista', 'cajero', 'gerente');
const salarioMensual = joi.number().min(0).precision(2);
const fechaContratacion = joi.date().iso();
const activo = joi.boolean();

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);
const search = joi.string().max(100);

const createEmpleado = joi.object({
    sucursalId: sucursalId.required(),
    nombres: nombres.required(),
    apellidos: apellidos.required(),
    dui,
    nit,
    puesto: puesto.required(),
    salarioMensual: salarioMensual.required(),
    fechaContratacion: fechaContratacion.required(),
    activo,
});

const updateEmpleado = joi.object({
    sucursalId,
    nombres,
    apellidos,
    dui,
    nit,
    puesto,
    salarioMensual,
    fechaContratacion,
    activo,
});

const getEmpleado = joi.object({
    id: id.required(),
});

const queryEmpleado = joi.object({
    limit,
    offset,
    sucursalId,
    puesto,
    activo,
    search,
});

module.exports = {
    createEmpleado,
    updateEmpleado,
    getEmpleado,
    queryEmpleado,
};