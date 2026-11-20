const { Router } = require('express');
const passport = require('passport');
const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handle');
const {
    abrirCaja,
    cerrarCaja,
    registrarMovimientoCaja,
    getCaja,
    queryCaja,
} = require('../schemas/caja.schema');
const {
    getCajasController,
    getCajaController,
    getCajaAbiertaSucursalController,
    abrirCajaController,
    registrarMovimientoCajaController,
    cerrarCajaController,
} = require('../controllers/caja.controller');

const cajaRouter = Router();

// Todas las rutas de caja exigen JWT y rol operativo de ventas/administración
cajaRouter.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'gerente', 'cajero')
);

cajaRouter.get(
    '/',
    validationSchema(queryCaja, 'query'),
    getCajasController
);

cajaRouter.get(
    '/sucursal/:sucursalId/abierta',
    getCajaAbiertaSucursalController
);

cajaRouter.get(
    '/:id',
    validationSchema(getCaja, 'params'),
    getCajaController
);

cajaRouter.post(
    '/abrir',
    validationSchema(abrirCaja, 'body'),
    abrirCajaController
);

cajaRouter.post(
    '/:id/movimientos',
    validationSchema(getCaja, 'params'),
    validationSchema(registrarMovimientoCaja, 'body'),
    registrarMovimientoCajaController
);

cajaRouter.post(
    '/:id/cerrar',
    validationSchema(getCaja, 'params'),
    validationSchema(cerrarCaja, 'body'),
    cerrarCajaController
);

module.exports = { cajaRouter };