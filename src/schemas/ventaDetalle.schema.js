const Joi = require('joi');

const id = Joi.number()
    .integer()
    .positive()
    .required();

const campos = {
    ventaId: Joi.number()
        .integer()
        .positive(),

    productoId: Joi.number()
        .integer()
        .positive(),

    cantidad: Joi.number()
        .integer()
        .min(1),

    precioUnitario: Joi.number()
        .min(0)
        .precision(2),

    subtotal: Joi.number()
        .min(0)
        .precision(2)
};

// Validar al crear un detalle de venta
const crearSchema = Joi.object({
    ventaId: campos.ventaId.required(),

    productoId: campos.productoId.required(),

    cantidad: campos.cantidad.required(),

    precioUnitario: campos.precioUnitario.required(),

    subtotal: campos.subtotal.required()
}).required();

// Validar al actualizar un detalle de venta
const actualizarSchema = Joi.object(campos)
    .min(1)
    .required();

// Validar el ID del detalle de venta
const idSchema = Joi.object({
    id
});

// Validar los filtros de consulta
const listarSchema = Joi.object({
    ventaId: campos.ventaId,

    productoId: campos.productoId,

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
