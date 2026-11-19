const Joi = require('joi');

const id = Joi.number()
    .integer()
    .positive()
    .required();

const campos = {
    planillaId: Joi.number()
        .integer()
        .positive(),

    empleadoId: Joi.number()
        .integer()
        .positive(),

    salarioBruto: Joi.number()
        .min(0)
        .precision(2),

    isss: Joi.number()
        .min(0)
        .precision(2),

    afp: Joi.number()
        .min(0)
        .precision(2),

    isr: Joi.number()
        .min(0)
        .precision(2),

    otrasDeducciones: Joi.number()
        .min(0)
        .precision(2),

    salarioNeto: Joi.number()
        .min(0)
        .precision(2)
};

// Validar al crear un detalle de planilla
const crearSchema = Joi.object({
    planillaId: campos.planillaId.required(),

    empleadoId: campos.empleadoId.required(),

    salarioBruto: campos.salarioBruto.required(),

    isss: campos.isss.default(0),

    afp: campos.afp.default(0),

    isr: campos.isr.default(0),

    otrasDeducciones: campos.otrasDeducciones.default(0),

    salarioNeto: campos.salarioNeto.required()
}).required();

// Validar al actualizar un detalle de planilla
const actualizarSchema = Joi.object(campos)
    .min(1)
    .required();

// Validar el ID del detalle de planilla
const idSchema = Joi.object({
    id
});

// Validar los filtros de consulta
const listarSchema = Joi.object({
    planillaId: campos.planillaId,

    empleadoId: campos.empleadoId,

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
