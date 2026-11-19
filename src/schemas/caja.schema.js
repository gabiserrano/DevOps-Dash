const Joi = require('joi');

const id = Joi.number()
    .integer()
    .positive()
    .required();

const campos = {
    sucursalId: Joi.number()
        .integer()
        .positive(),

    usuarioId: Joi.number()
        .integer()
        .positive(),

    turno: Joi.string()
        .valid('manana', 'tarde', 'noche'),

    montoInicial: Joi.number()
        .min(0)
        .precision(2),

    observaciones: Joi.string()
        .trim()
        .max(300)
        .allow(null, ''),

    estado: Joi.string()
        .valid('abierta', 'cerrada')
};

// Validar la apertura de una caja
const crearSchema = Joi.object({
    sucursalId: campos.sucursalId.required(),
    usuarioId: campos.usuarioId.required(),
    turno: campos.turno.required(),
    montoInicial: campos.montoInicial.required(),
    observaciones: campos.observaciones
}).required();

// Validar modificaciones permitidas
const actualizarSchema = Joi.object({
    observaciones: campos.observaciones
}).min(1).required();

// Validar los datos del cierre
const cerrarSchema = Joi.object({
    efectivoReal: Joi.number()
        .min(0)
        .precision(2)
        .required(),

    observaciones: campos.observaciones
}).required();

// Validar el ID de la caja
const idSchema = Joi.object({
    id
});

// Validar los filtros de consulta
const listarSchema = Joi.object({
    sucursalId: campos.sucursalId,
    usuarioId: campos.usuarioId,
    turno: campos.turno,
    estado: campos.estado,

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
    cerrarSchema,
    idSchema,
    listarSchema
};
