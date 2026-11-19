const joi = require('joi');

const id = joi.number().integer().positive();
const nombre = joi.string().min(2).max(120);
const categoria = joi.string().max(50).allow(null, '');
const tipo = joi.string().valid('elaborado', 'reventa');
const precio = joi.number().min(0).precision(2);
const insumoId = joi.number().integer().positive().allow(null);
const activo = joi.boolean();

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);
const search = joi.string().max(120);

const createProducto = joi.object({
    nombre: nombre.required(),
    categoria,
    tipo: tipo.required(),
    precio: precio.required(),
    insumoId: joi.when('tipo', {
        is: 'reventa',
        then: joi.number().integer().positive().required().messages({
            'any.required': 'El insumoId es obligatorio para productos de tipo reventa',
        }),
        otherwise: insumoId,
    }),
    activo,
});

const updateProducto = joi.object({
    nombre,
    categoria,
    tipo,
    precio,
    insumoId: joi.when('tipo', {
        is: 'reventa',
        then: joi.number().integer().positive().required().messages({
            'any.required': 'El insumoId es obligatorio para productos de tipo reventa',
        }),
        otherwise: insumoId,
    }),
    activo,
});

const getProducto = joi.object({
    id: id.required(),
});

const queryProducto = joi.object({
    limit,
    offset,
    categoria: joi.string().max(50),
    tipo,
    activo,
    search,
});

module.exports = {
    createProducto,
    updateProducto,
    getProducto,
    queryProducto,
};