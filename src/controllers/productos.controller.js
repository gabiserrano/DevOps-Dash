
const servicio = require('./productos.service');

// Express 5 captura automáticamente rechazos de funciones async.
const listar = async (req, res) =>
  res.json(await servicio.listar(res.locals.validatedQuery));

const obtener = async (req, res) =>
  res.json(await servicio.obtener(req.params.id));

const crear = async (req, res) =>
  res.status(201).json(await servicio.crear(req.body));

const actualizar = async (req, res) =>
  res.json(await servicio.actualizar(req.params.id, req.body));

const desactivar = async (req, res) =>
  res.json(await servicio.desactivar(req.params.id));

module.exports = {
  listar, obtener, crear, actualizar, desactivar
};
