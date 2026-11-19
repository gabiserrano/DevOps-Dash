const joi = require('joi');

const id = joi.number().integer().positive();
const sucursalId = joi.number().integer().positive();
const insumoId = joi.number().integer().positive();
const stockMinimo = joi.number().min(0).precision(3);
const cantidad = joi.number().precision(3);
const motivo = joi.string().min(3).max(30);
const usuarioId = joi.number().integer().positive().allow(null);
const bajoStock = joi.boolean();

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);

const updateStockMinimo = joi.object({
    stockMinimo: stockMinimo.required(),
});

const ajusteInventario = joi.object({
    sucursalId: sucursalId.required(),
    insumoId: insumoId.required(),
    tipo: joi.string().valid('entrada', 'salida', 'ajuste').required(),
    cantidad: cantidad.greater(0).required(),
    motivo: motivo.required(),
    usuarioId,
});

const getInventario = joi.object({
    id: id.required(),
});

const queryInventario = joi.object({
    limit,
    offset,
    sucursalId,
    insumoId,
    bajoStock,
});

module.exports = {
    updateStockMinimo,
    ajusteInventario,
    getInventario,
    queryInventario,
};