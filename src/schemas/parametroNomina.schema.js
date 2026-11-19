const Joi = require('joi');

const clave = Joi.string()
    .trim()
    .min(1)
    .max(30)
    .required();

const campos = {
    clave: Joi.string()
        .trim()
        .min(1)
        .max(30),

    valor: Joi.number()
        .precision(4)
};

// Validar al crear un parámetro de nómina
const crearSchema = Joi.object({
    clave: campos.clave.required(),

    valor: campos.valor.required()
}).required();

// Validar al actualizar un parámetro
const actualizarSchema = Joi.object({
    valor: campos.valor
        .required()
}).required();

// Validar la clave del parámetro
const claveSchema = Joi.object({
    clave
});

// Validar los filtros de consulta
const listarSchema = Joi.object({
    buscar: Joi.string()
        .trim()
        .max(30),

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
    claveSchema,
    listarSchema
};
