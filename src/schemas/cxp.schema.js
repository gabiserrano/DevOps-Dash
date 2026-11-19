const joi = require('joi');

const id = joi.number().integer().positive();
const cxpId = joi.number().integer().positive();
const proveedorId = joi.number().integer().positive();
const monto = joi.number().min(0.01).precision(2);
const metodoPagoId = joi.number().integer().positive().allow(null);
const usuarioId = joi.number().integer().positive().allow(null);
const estado = joi.string().valid('pendiente', 'parcial', 'pagada');

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);

const registrarPagoCxp = joi.object({
    cxpId: cxpId.required(),
    monto: monto.required(),
    metodoPagoId,
    usuarioId,
});

const getCxp = joi.object({
    id: id.required(),
});

const queryCxp = joi.object({
    limit,
    offset,
    proveedorId,
    estado,
});

module.exports = {
    registrarPagoCxp,
    getCxp,
    queryCxp,
};