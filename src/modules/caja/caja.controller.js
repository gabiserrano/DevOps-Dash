const Joi = require('joi');
const cajaService = require('./caja.service');

const aperturaSchema = Joi.object({
  usuario_id: Joi.number().integer().positive().required(),
  turno: Joi.string().valid('manana', 'tarde', 'noche').required(),
  monto_inicial: Joi.number().min(0).required(),
});

async function abrir(req, res, next) {
  try {
    const { error, value } = aperturaSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: error.details.map((d) => d.message),
      });
    }

    const caja = await cajaService.abrirCaja({
      usuarioId: value.usuario_id,
      turno: value.turno,
      montoInicial: value.monto_inicial,
    });
    res.status(201).json(caja);
  } catch (err) {
    next(err);
  }
}

async function obtenerAbierta(req, res, next) {
  try {
    const usuarioId = Number(req.params.usuarioId);
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res.status(400).json({ error: 'usuarioId inválido' });
    }
    const caja = await cajaService.obtenerCajaAbierta(usuarioId);
    res.json(caja);
  } catch (err) {
    next(err);
  }
}

module.exports = { abrir, obtenerAbierta };