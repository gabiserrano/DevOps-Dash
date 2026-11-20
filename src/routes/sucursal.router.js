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

// Todas las rutas de sucursales requieren JWT y rol 'admin'
sucursalRouter.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin')
);

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
    validationSchema(createSucursal, 'body'),
    createSucursalController
);

sucursalRouter.patch(
    '/:id',
    validationSchema(getSucursal, 'params'),
    validationSchema(updateSucursal, 'body'),
    updateSucursalController
);

module.exports = { sucursalRouter };