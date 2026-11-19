const Joi = require('joi');

const id = Joi.number()
    .integer()
    .positive()
    .required();

const campos = {
    sucursalId: Joi.number()
        .integer()
        .positive()
        .allow(null),

    fechaInicio: Joi.date()
        .iso(),

    fechaFin: Joi.date()
        .iso(),

    estado: Joi.string()
        .valid('borrador', 'aprobada', 'pagada'),

    creadaPor: Joi.number()
        .integer()
        .positive()
        .allow(null)
};

// Validar que la fecha final no sea anterior a la inicial
const validarFechas = (datos, helpers) => {
    if (datos.fechaInicio && datos.fechaFin &&
        datos.fechaFin < datos.fechaInicio) {
        return helpers.message(
            'La fecha de fin no puede ser anterior a la fecha de inicio'
        );
    }

    return datos;
};

// Validar al crear una planilla
const crearSchema = Joi.object({
    sucursalId: campos.sucursalId,

    fechaInicio: campos.fechaInicio.required(),

    fechaFin: campos.fechaFin.required(),

    estado: campos.estado.default('borrador'),

    creadaPor: campos.creadaPor
}).custom(validarFechas).required();

// Validar al actualizar una planilla
const actualizarSchema = Joi.object(campos)
    .min(1)
    .custom(validarFechas)
    .required();

// Validar el ID de la planilla
const idSchema = Joi.object({
    id
});

// Validar los filtros de consulta
const listarSchema = Joi.object({
    sucursalId: campos.sucursalId,

    estado: campos.estado,

    fechaInicio: campos.fechaInicio,

    fechaFin: campos.fechaFin,

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
    listarSchema,
    validarFechas
};
