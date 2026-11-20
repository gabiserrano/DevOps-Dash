
const express = require('express');
const passport = require('passport');

const {
    getVentasController,
    getVentaController,
    createVentaController,
} = require('../controllers/venta.controller');

const {
    createVenta,
    getVenta,
    queryVenta,
} = require('../schemas/venta.schema');

const {
    validationSchema,
} = require('../middlewares/validation.schema');

const { checkRoles } = require('../middlewares/auth.handle');

const router = express.Router();

// Ventas: operación de caja y supervisión.
router.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'gerente', 'cajero')
);

router.get(
    '/',
    validationSchema(queryVenta, 'query'),
    getVentasController
);

router.get(
    '/:id',
    validationSchema(getVenta, 'params'),
    getVentaController
);

router.post(
    '/',
    validationSchema(createVenta, 'body'),
    createVentaController
);

module.exports = router;
