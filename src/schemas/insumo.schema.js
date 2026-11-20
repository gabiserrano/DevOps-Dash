const joi = require('joi');

const id = joi.number().integer().positive();
const nombre = joi.string().min(2).max(120);
const unidad = joi.string().min(1).max(10); // g, ml, und
const costoPromedio = joi.number().min(0).precision(4);
const activo = joi.boolean();

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);
const search = joi.string().max(120);

const createInsumo = joi.object({
    nombre: nombre.required(),
    sku: joi.string().max(30).allow(null, ''),
    categoria: joi.string().max(50).allow(null, ''),
    unidad: unidad.required(),
    costoPromedio,
    activo,
    proveedorIds: joi.array().items(joi.number().integer().positive()),
});

const updateInsumo = joi.object({
    nombre,
    sku: joi.string().max(30).allow(null, ''),
    categoria: joi.string().max(50).allow(null, ''),
    unidad,
    costoPromedio,
    activo,
    proveedorIds: joi.array().items(joi.number().integer().positive()),
});

const getInsumo = joi.object({
    id: id.required(),
});

const queryInsumo = joi.object({
    limit,
    offset,
    activo,
    search,
});

module.exports = {
    createInsumo,
    updateInsumo,
    getInsumo,
    queryInsumo,
};