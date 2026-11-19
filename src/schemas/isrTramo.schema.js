const Joi = require('joi');

const id = Joi.number()
    .integer()
    .positive()
    .required();

const campos = {
    periodo: Joi.string()
        .trim()
        .max(10)
        .default('quincenal'),

    desde: Joi.number()
        .min(0)
        .precision(2),

    hasta: Joi.number()
        .min(0)
        .precision(2)
        .allow(null),

    porcentaje: Joi.number()
        .min(0)
        .max(100)
        .precision(2),

    sobre_exceso: Joi.number()
        .min(0)
        .precision(2)
        .default(0),

    cuota_fija: Joi.number()
        .min(0)
        .precision(2)
        .default(0)
};

// Validar al crear un tramo ISR
const crearSchema = Joi.object({
    periodo: campos.periodo,

    desde: campos.desde.required(),

    hasta: campos.hasta,

    porcentaje: campos.porcentaje.required(),

    sobre_exceso: campos.sobre_exceso,

    cuota_fija: campos.cuota_fija
}).required();

// Validar al actualizar un tramo ISR
const actualizarSchema = Joi.object({
    periodo: Joi.string()
        .trim()
        .max(10),

    desde: campos.desde,

    hasta: campos.hasta,

    porcentaje: campos.porcentaje,

    sobre_exceso: Joi.number()
        .min(0)
        .precision(2),

    cuota_fija: Joi.number()
        .min(0)
        .precision(2)
}).min(1).required();

// Validar el ID del tramo
const idSchema = Joi.object({
    id
});

// Validar filtros de consulta
const listarSchema = Joi.object({
    periodo: Joi.string()
        .trim()
        .max(10),

    pagina: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limite: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
});

module.exports = {
    crearSchema,
    actualizarSchema,
    idSchema,
    listarSchema
};
