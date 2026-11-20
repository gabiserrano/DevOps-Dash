
const { Router } = require('express');

const { validationSchema } = require('../middlewares/validation.schema');

const {
  createCompra,
  getCompra,
  queryCompra
} = require('../schemas/compra.schema');

const comprasController = require('../controllers/compras.controller');

const router = Router();

router.get(
  '/',
  validationSchema(queryCompra, 'query'),
  comprasController.listar
);

router.get(
  '/:id',
  validationSchema(getCompra, 'params'),
  comprasController.obtener
);

router.post(
  '/',
  validationSchema(createCompra, 'body'),
  comprasController.crear
);

module.exports = router;
