const joi = require('joi');

const id = joi.number().integer().positive();
const nombre = joi.string().min(2).max(150);
const nit = joi.string().max(17).allow(null, '');
const nrc = joi.string().max(15).allow(null, '');
const telefono = joi.string().max(20).allow(null, '');
const email = joi.string().email().max(120).allow(null, '');
const direccion = joi.string().max(200).allow(null, '');
const diasCredito = joi.number().integer().min(0);
const activo = joi.boolean();

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);
const search = joi.string().max(150);

const createProveedor = joi.object({
    nombre: nombre.required(),
    nit,
    nrc,
    telefono,
    email,
    direccion,
    diasCredito,
    activo,
});

const updateProveedor = joi.object({
    nombre,
    nit,
    nrc,
    telefono,
    email,
    direccion,
    diasCredito,
    activo,
});

const getProveedor = joi.object({
    id: id.required(),
});

const queryProveedor = joi.object({
    limit,
    offset,
    activo,
    search,
});

module.exports = {
    createProveedor,
    updateProveedor,
    getProveedor,
    queryProveedor,
};