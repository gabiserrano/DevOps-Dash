const joi = require('joi');

const id = joi.number().integer().positive();
const nombre = joi.string().min(3).max(100);
const direccion = joi.string().max(200).allow(null, '');
const telefono = joi.string().max(20).allow(null, '');
const activa = joi.boolean();

const createSucursal = joi.object({
    nombre: nombre.required(),
    direccion,
    telefono,
    activa,
});

const updateSucursal = joi.object({
    nombre,
    direccion,
    telefono,
    activa,
});

const getSucursal = joi.object({
    id: id.required(),
});

module.exports = {
    createSucursal,
    updateSucursal,
    getSucursal,
};