const joi = require('joi');

const id = joi.number().integer().positive();
const sucursalId = joi.number().integer().positive();
const cajaId = joi.number().integer().positive();
const usuarioId = joi.number().integer().positive();
const clienteId = joi.number().integer().positive().allow(null);
const tipoDoc = joi.string().valid('FCF', 'CCF');
const serie = joi.string().max(10);
const estado = joi.string().valid('emitida', 'anulada');

const ventaDetalleItem = joi.object({
    productoId: joi.number().integer().positive().required(),
    cantidad: joi.number().integer().min(1).required(),
    precioUnitario: joi.number().min(0).precision(2).required(),
    subtotal: joi.number().min(0).precision(2).required(),
});

const ventaPagoItem = joi.object({
    metodoPagoId: joi.number().integer().positive().required(),
    monto: joi.number().min(0.01).precision(2).required(),
    referencia: joi.string().max(80).allow(null, ''),
});

const limit = joi.number().integer().min(1).max(100);
const offset = joi.number().integer().min(0);

const createVenta = joi.object({
    sucursalId: sucursalId.required(),
    cajaId: cajaId.required(),
    usuarioId: usuarioId.required(),
    tipoDoc: tipoDoc.required(),
    serie,
    clienteId: joi.when('tipoDoc', {
        is: 'CCF',
        then: joi.number().integer().positive().required().messages({
            'any.required': 'El clienteId es obligatorio para emitir un CCF',
        }),
        otherwise: clienteId,
    }),
    subtotal: joi.number().min(0).precision(2).required(),
    iva: joi.number().min(0).precision(2).required(),
    total: joi.number().min(0).precision(2).required(),
    detalles: joi.array().items(ventaDetalleItem).min(1).required(),
    pagos: joi.array().items(ventaPagoItem).min(1).required(),
});

const getVenta = joi.object({
    id: id.required(),
});

const queryVenta = joi.object({
    limit,
    offset,
    sucursalId,
    cajaId,
    usuarioId,
    clienteId,
    tipoDoc,
    estado,
    fechaInicio: joi.date().iso(),
    fechaFin: joi.date().iso(),
});

module.exports = {
    createVenta,
    getVenta,
    queryVenta,
};