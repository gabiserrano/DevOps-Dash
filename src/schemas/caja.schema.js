const joi = require('joi');

const id = joi.number().integer().positive();
const sucursalId = joi.number().integer().positive();
const usuarioId = joi.number().integer().positive();
const turno = joi.string().valid('manana', 'tarde', 'noche');
const montoInicial = joi.number().min(0).precision(2);
const efectivoReal = joi.number().min(0).precision(2);
const observaciones = joi.string().max(300).allow(null, '');
const estado = joi.string().valid('abierta', 'cerrada');

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);

const abrirCaja = joi.object({
    sucursalId: sucursalId.required(),
    usuarioId: usuarioId.required(),
    turno: turno.required(),
    montoInicial: montoInicial.required(),
});

const cerrarCaja = joi.object({
    efectivoReal: efectivoReal.required(),
    observaciones,
});

const registrarMovimientoCaja = joi.object({
    cajaId: id.required(),
    tipo: joi.string().valid('ingreso', 'egreso').required(),
    concepto: joi.string().min(3).max(200).required(),
    monto: joi.number().min(0.01).precision(2).required(),
    usuarioId: usuarioId.allow(null),
});

const getCaja = joi.object({
    id: id.required(),
});

const queryCaja = joi.object({
    limit,
    offset,
    sucursalId,
    usuarioId,
    estado,
    turno,
});

module.exports = {
    abrirCaja,
    cerrarCaja,
    registrarMovimientoCaja,
    getCaja,
    queryCaja,
};