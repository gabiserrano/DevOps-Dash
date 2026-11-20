
const { Router } = require('express');
const passport = require('passport');

const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handle');

const {
  createCompra,
  getCompra,
  queryCompra
} = require('../schemas/compra.schema');

const comprasController = require('../controllers/compras.controller');

const router = Router();

// Compras: solo perfiles con acceso a abastecimiento.
router.use(
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'gerente', 'compras')
);

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
