const joi = require('joi');

const id = joi.number().integer().positive();
const productoId = joi.number().integer().positive();
const insumoId = joi.number().integer().positive();
const cantidad = joi.number().min(0.001).precision(3);

const ingredienteItem = joi.object({
    insumoId: insumoId.required(),
    cantidad: cantidad.required(),
});

// Para guardar o reemplazar la receta completa de un producto de una sola vez
const upsertReceta = joi.object({
    productoId: productoId.required(),
    ingredientes: joi.array().items(ingredienteItem).min(1).required(),
});

// Para agregar o editar un ingrediente individual
const createRecetaItem = joi.object({
    productoId: productoId.required(),
    insumoId: insumoId.required(),
    cantidad: cantidad.required(),
});

const updateRecetaItem = joi.object({
    cantidad: cantidad.required(),
});

const getReceta = joi.object({
    id: id.required(),
});

const getRecetaByProducto = joi.object({
    productoId: productoId.required(),
});

module.exports = {
    upsertReceta,
    createRecetaItem,
    updateRecetaItem,
    getReceta,
    getRecetaByProducto,
};