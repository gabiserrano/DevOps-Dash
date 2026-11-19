const Joi = require('joi');

const id = Joi.number()
    .integer()
    .positive()
    .required();

const campos = {
    ventaId: Joi.number()
        .integer()
        .positive(),

    metodoPagoId: Joi.number()
        .integer()
        .positive(),

    monto: Joi.number()
        .min(0.01)
        .precision(2),

    referencia: Joi.string()
        .trim()
        .max(80)
        .allow(null, '')
};

// Validar al crear un pago
const crearSchema = Joi.object({
    ventaId: campos.ventaId.required(),

    metodoPagoId: campos.metodoPagoId.required(),

    monto: campos.monto.required(),

    referencia: campos.referencia
}).required();

// Validar al actualizar un pago
const actualizarSchema = Joi.object(campos)
    .min(1)
    .required();

// Validar el ID del pago
const idSchema = Joi.object({
    id
});

// Validar filtros de consulta
const listarSchema = Joi.object({
    ventaId: campos.ventaId,

    metodoPagoId: campos.metodoPagoId,

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
