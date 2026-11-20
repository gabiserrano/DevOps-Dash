const { Router } = require('express');
const passport = require('passport');
const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handle');
const {
    getInventario,
    queryInventario,
    updateStockMinimo,
    setStockMinimo,
    ajusteInventario,
    queryMovimientoInventario,
} = require('../schemas/inventario.schema');
const {
    getInventariosController,
    getMovimientosInventarioController,
    updateStockMinimoController,
    setStockMinimoController,
    registrarAjusteInventarioController,
} = require('../controllers/inventario.controller');

const inventarioRouter = Router();

// Autenticación obligatoria para todas las rutas de inventario
inventarioRouter.use(passport.authenticate('jwt', { session: false }));

inventarioRouter.get(
    '/',
    checkRoles('admin', 'gerente', 'compras', 'barista'),
    validationSchema(queryInventario, 'query'),
    getInventariosController
);

inventarioRouter.get(
    '/movimientos',
    checkRoles('admin', 'gerente', 'compras', 'barista'),
    validationSchema(queryMovimientoInventario, 'query'),
    getMovimientosInventarioController
);

inventarioRouter.patch(
    '/minimo',
    checkRoles('admin', 'gerente'),
    validationSchema(setStockMinimo, 'body'),
    setStockMinimoController
);

inventarioRouter.patch(
    '/:id/minimo',
    checkRoles('admin', 'gerente'),
    validationSchema(getInventario, 'params'),
    validationSchema(updateStockMinimo, 'body'),
    updateStockMinimoController
);

inventarioRouter.post(
    '/ajuste',
    checkRoles('admin', 'gerente'),
    validationSchema(ajusteInventario, 'body'),
    registrarAjusteInventarioController
);

module.exports = { inventarioRouter };