const joi = require('joi');

const id = joi.number().integer().positive();
const sucursalId = joi.number().integer().positive().allow(null);
const fechaInicio = joi.date().iso();
const fechaFin = joi.date().iso().min(joi.ref('fechaInicio'));
const estado = joi.string().valid('borrador', 'aprobada', 'pagada');
const creadaPor = joi.number().integer().positive().allow(null);
const otrasDeducciones = joi.number().min(0).precision(2);

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);

const generarPlanilla = joi.object({
    sucursalId,
    fechaInicio: fechaInicio.required(),
    fechaFin: fechaFin.required(),
    creadaPor,
});

const cambiarEstadoPlanilla = joi.object({
    estado: estado.required(),
});

const updateDetallePlanilla = joi.object({
    otrasDeducciones: otrasDeducciones.required(),
});

const getPlanilla = joi.object({
    id: id.required(),
});

const queryPlanilla = joi.object({
    limit,
    offset,
    sucursalId,
    estado,
});

module.exports = {
    generarPlanilla,
    cambiarEstadoPlanilla,
    updateDetallePlanilla,
    getPlanilla,
    queryPlanilla,
};