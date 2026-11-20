const { Router } = require('express');
const { validationSchema } = require('../middlewares/validation.schema');
const {
  createProducto,
  updateProducto,
  getProducto,
  queryProducto,
} = require('../schemas/producto.schema');
const {
  getProductosController,
  getProductoController,
  createProductoController,
  updateProductoController,
} = require('../controllers/producto.controller');
const passport = require('passport');
const { checkRoles } = require('../middlewares/auth.handle');

const productoRouter = Router();

productoRouter.use(passport.authenticate('jwt', { session: false }))

productoRouter.get(
  '/',
  checkRoles('admin', 'cajero', 'comprador'),
  validationSchema(queryProducto, 'query'),
  getProductosController
);

productoRouter.get(
  '/:id',
  validationSchema(getProducto, 'params'),
  getProductoController
);

productoRouter.post(
  '/',
  validationSchema(createProducto, 'body'),
  createProductoController
);

productoRouter.patch(
  '/:id',
  validationSchema(getProducto, 'params'),
  validationSchema(updateProducto, 'body'),
  updateProductoController
);

module.exports = { productoRouter };