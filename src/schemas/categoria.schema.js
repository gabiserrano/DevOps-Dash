const Joi = require('joi');

const id = Joi.number().integer().positive();
const nombre = Joi.string().trim().min(2).max(50);

const createCategoria = Joi.object({
    nombre: nombre.required(),
});

const updateCategoria = Joi.object({
    nombre: nombre.required(),
});

const getCategoria = Joi.object({
    id: id.required(),
});

const queryCategoria = Joi.object({
    search: Joi.string().trim().max(50),
});

module.exports = { createCategoria, updateCategoria, getCategoria, queryCategoria };
