
const Joi = require('joi');

const id = Joi.number().integer().positive().required();

const campos = {
  nombre: Joi.string().trim().max(120),
  categoria: Joi.string().trim().max(50).allow(null, ''),
  tipo: Joi.string().valid('elaborado', 'reventa'),
  precio: Joi.number().min(0).precision(2),
  insumo_id: Joi.number().integer().positive().allow(null),
  activo: Joi.boolean()
};

const coherencia = (datos, helpers) => {
  if (datos.tipo === 'reventa' && datos.insumo_id == null) {
    return helpers.message('Los productos de reventa requieren insumo_id');
  }
  if (datos.tipo === 'elaborado' && datos.insumo_id != null) {
    return helpers.message('Los productos elaborados no deben tener insumo_id; sus insumos se definen en recetas');
  }
  return datos;
};

const crearSchema = Joi.object({
  ...campos,
  nombre: campos.nombre.required(),
  tipo: campos.tipo.required(),
  precio: campos.precio.required(),
  activo: campos.activo.default(true)
}).custom(coherencia).required();

const actualizarSchema = Joi.object(campos).min(1).required();

const idSchema = Joi.object({ id });

const listarSchema = Joi.object({
  activo: Joi.boolean(),
  tipo: campos.tipo,
  buscar: Joi.string().trim().max(120),
  pagina: Joi.number().integer().min(1).default(1),
  limite: Joi.number().integer().min(1).max(100).default(20)
});

module.exports = {
  crearSchema, actualizarSchema, idSchema,
  listarSchema, coherencia
};
