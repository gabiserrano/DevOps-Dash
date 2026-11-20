const { Router } = require('express');
const passport = require('passport');
const { checkRoles } = require('../middlewares/auth.handle');
const { validationSchema } = require('../middlewares/validation.schema');

const {
    createSucursal,
    updateSucursal,
    getSucursal,
} = require('../schemas/sucursal.schema');

const {
    getSucursalesController,
    getSucursalController,
    createSucursalController,
    updateSucursalController,
} = require('../controllers/sucursal.controller');

const sucursalRouter = Router();


sucursalRouter.use(passport.authenticate('jwt', { session: false }));


sucursalRouter.get(
    '/',
    checkRoles('admin', 'cajero', 'comprador'),
    getSucursalesController
);


sucursalRouter.get(
    '/:id',
    checkRoles('admin', 'cajero', 'comprador'),
    validationSchema(getSucursal, 'params'),
    getSucursalController
);


sucursalRouter.post(
    '/',
    checkRoles('admin'),
    validationSchema(createSucursal, 'body'),
    createSucursalController
);


sucursalRouter.patch(
    '/:id',
    checkRoles('admin'),
    validationSchema(getSucursal, 'params'),
    validationSchema(updateSucursal, 'body'),
    updateSucursalController
);

module.exports = { sucursalRouter };

