const joi = require('joi');

const id = joi.number().integer().positive();
const empleadoId = joi.number().integer().positive().allow(null);
const sucursalId = joi.number().integer().positive();
const rolId = joi.number().integer().positive();
const email = joi.string().email().max(120);
const password = joi.string().min(6).max(100);
const activo = joi.boolean();

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);

const createUsuario = joi.object({
    empleadoId,
    sucursalId: sucursalId.required(),
    rolId: rolId.required(),
    email: email.required(),
    password: password.required(),
    activo,
});

const updateUsuario = joi.object({
    empleadoId,
    sucursalId,
    rolId,
    email,
    password,
    activo,
}).min(1);

const getUsuario = joi.object({
    id: id.required(),
});

const queryUsuario = joi.object({
    limit,
    offset,
    sucursalId,
    rolId,
    activo,
});

module.exports = {
    createUsuario,
    updateUsuario,
    getUsuario,
    queryUsuario,
};