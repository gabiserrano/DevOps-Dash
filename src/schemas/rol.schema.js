const Joi = require('joi');

const id = Joi.number()
    .integer()
    .positive()
    .required();

const campos = {
    nombre: Joi.string()
        .trim()
        .max(30)
};

const crearSchema = Joi.object({
    nombre: campos.nombre
        .min(1)
        .required()
}).required();

const actualizarSchema = Joi.object({
    nombre: campos.nombre
        .min(1)
}).min(1).required();

const idSchema = Joi.object({
    id
});

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
    idSchema,
    listarSchema
};
