const joi = require('joi');

const id = joi.number().integer().positive();
const nombre = joi.string().min(2).max(150);
const nit = joi.string().max(17).allow(null, '');
const nrc = joi.string().max(15).allow(null, '');
const giro = joi.string().max(150).allow(null, '');
const direccion = joi.string().max(200).allow(null, '');
const email = joi.string().email().max(120).allow(null, '');

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);
const search = joi.string().max(150);

const createCliente = joi.object({
    nombre: nombre.required(),
    nit,
    nrc,
    giro,
    direccion,
    email,
});

const updateCliente = joi.object({
    nombre,
    nit,
    nrc,
    giro,
    direccion,
    email,
});

const getCliente = joi.object({
    id: id.required(),
});

const queryCliente = joi.object({
    limit,
    offset,
    search,
});

module.exports = {
    createCliente,
    updateCliente,
    getCliente,
    queryCliente,
};