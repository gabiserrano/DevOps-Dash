const Joi = require('joi');

const id = Joi.number()
    .integer()
    .positive()
    .required();

const campos = {
    cajaId: Joi.number()
        .integer()
        .positive(),

    tipo: Joi.string()
        .valid('ingreso', 'egreso'),

    concepto: Joi.string()
        .trim()
        .min(1)
        .max(200),

    monto: Joi.number()
        .positive()
        .precision(2),

    fecha: Joi.date(),

    usuarioId: Joi.number()
        .integer()
        .positive()
        .allow(null)
};

// Validar al crear un movimiento de caja
const crearSchema = Joi.object({
    cajaId: campos.cajaId.required(),

    tipo: campos.tipo.required(),

    concepto: campos.concepto.required(),

    monto: campos.monto.required(),

    usuarioId: campos.usuarioId
}).required();

// Validar al actualizar un movimiento
const actualizarSchema = Joi.object({
    tipo: campos.tipo,

    concepto: campos.concepto,

    monto: campos.monto,

    usuarioId: campos.usuarioId
}).min(1).required();

// Validar el ID del movimiento
const idSchema = Joi.object({
    id
});

// Validar los filtros de consulta
const listarSchema = Joi.object({
    cajaId: campos.cajaId,

    usuarioId: campos.usuarioId,

    tipo: campos.tipo,

    fecha: campos.fecha,

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
