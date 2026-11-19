const express = require('express');
const { validationSchema } = require('../middlewares/validation.schema');
const { createProducto } = require('../schemas/producto.schema');
const { createProductoController } = require('../controllers/producto.controller');

const productoRouter = express.Router();

productoRouter.get(
  '/',
  validationSchema(queryProducto, 'query'),
  getProductosController
);

productoRouter.post(
  '/',
  validationSchema(createProducto, 'body'),
  createProductoController
);

module.exports = { productoRouter };
