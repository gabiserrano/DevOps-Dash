const Joi = require('joi');

const id = Joi.number().integer().positive();
const nombre = Joi.string().trim().min(2).max(30);

const createRol = Joi.object({
    nombre: nombre.required()
});

const updateRol = Joi.object({
    nombre
}).min(1);

const getRol = Joi.object({
    id: id.required()
});

const queryRol = Joi.object({
    limit: Joi.number().integer().min(1).max(100),
    offset: Joi.number().integer().min(0),
    search: Joi.string().trim().max(30),
});

module.exports = {
    createRol,
    updateRol,
    getRol,
    queryRol
};
