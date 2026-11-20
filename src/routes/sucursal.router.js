const { Router } = require('express');
const passport = require('passport');
const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handle');
const {
    createSucursal,
    updateSucursal,
    getSucursal,
    querySucursal,
} = require('../schemas/sucursal.schema');
const {
    getSucursalesController,
    getSucursalController,
    createSucursalController,
    updateSucursalController,
} = require('../controllers/sucursal.controller');

const sucursalRouter = Router();

// Lectura de sucursales: cualquier usuario autenticado (la necesitan los
// selectores de Inventario, Compras y POS). La escritura queda para admin/gerente.
sucursalRouter.use(passport.authenticate('jwt', { session: false }));

sucursalRouter.get(
    '/',
    validationSchema(querySucursal, 'query'),
    getSucursalesController
);

sucursalRouter.get(
    '/:id',
    validationSchema(getSucursal, 'params'),
    getSucursalController
);

sucursalRouter.post(
    '/',
    checkRoles('admin', 'gerente'),
    validationSchema(createSucursal, 'body'),
    createSucursalController
);

sucursalRouter.patch(
    '/:id',
    checkRoles('admin', 'gerente'),
    validationSchema(getSucursal, 'params'),
    validationSchema(updateSucursal, 'body'),
    updateSucursalController
);

module.exports = { sucursalRouter };