
const { CompraService } = require('../services/compras.service');

const comprasService = new CompraService();

// Obtener todas las compras
const listar = async (req, res, next) => {
  try {
    const compras = await comprasService.findAll(req.query);

    return res.status(200).json(compras);
  } catch (error) {
    return next(error);
  }
};

// Obtener una compra por su ID
const obtener = async (req, res, next) => {
  try {
    const { id } = req.params;

    const compra = await comprasService.findOne(id);

    return res.status(200).json(compra);
  } catch (error) {
    return next(error);
  }
};

// Registrar una nueva compra
const crear = async (req, res, next) => {
  try {
    const compra = await comprasService.create(req.body);

    return res.status(201).json(compra);
  } catch (error) {
    return next(error);
  }
};

// Registrar un pago a una cuenta por pagar
const registrarPago = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    // Aquí id representa el ID de la cuenta por pagar
    const pago = await comprasService.registrarPagoCxp(id, datos);

    return res.status(201).json(pago);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  registrarPago
};
