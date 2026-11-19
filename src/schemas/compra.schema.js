const joi = require('joi');

const id = joi.number().integer().positive();
const sucursalId = joi.number().integer().positive();
const proveedorId = joi.number().integer().positive();
const numeroFactura = joi.string().min(1).max(40);
const fecha = joi.date().iso();
const tipoPago = joi.string().valid('contado', 'credito');
const clasificacion = joi.string().valid('costo', 'gasto');
const subtotal = joi.number().min(0).precision(2);
const iva = joi.number().min(0).precision(2);
const total = joi.number().min(0).precision(2);
const usuarioId = joi.number().integer().positive().allow(null);

const compraDetalleItem = joi.object({
    insumoId: joi.number().integer().positive().required(),
    cantidad: joi.number().min(0.001).precision(3).required(),
    costoUnitario: joi.number().min(0).precision(4).required(),
    subtotal: joi.number().min(0).precision(2).required(),
});

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);

const createCompra = joi.object({
    sucursalId: sucursalId.required(),
    proveedorId: proveedorId.required(),
    numeroFactura: numeroFactura.required(),
    fecha: fecha.required(),
    tipoPago: tipoPago.required(),
    clasificacion,
    subtotal: subtotal.required(),
    iva,
    total: total.required(),
    usuarioId,
    detalles: joi.array().items(compraDetalleItem).min(1).required(),
});

const getCompra = joi.object({
    id: id.required(),
});

const queryCompra = joi.object({
    limit,
    offset,
    sucursalId,
    proveedorId,
    tipoPago,
    clasificacion,
    fechaInicio: fecha,
    fechaFin: fecha,
});

module.exports = {
    createCompra,
    getCompra,
    queryCompra,
};