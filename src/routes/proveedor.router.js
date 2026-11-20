const { Router } = require('express');
const passport = require('passport');
const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handler');
const {
    createProveedor,
    updateProveedor,
    getProveedor,
    queryProveedor,
} = require('../schemas/proveedor.schema');
const {
    getProveedoresController,
    getProveedorController,
    createProveedorController,
    updateProveedorController,
} = require('../controllers/proveedor.controller');

const proveedorRouter = Router();

// Autenticación y autorización para gestión de proveedores
proveedorRouter.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'gerente', 'compras')
);

proveedorRouter.get(
    '/',
    validationSchema(queryProveedor, 'query'),
    getProveedoresController
);

proveedorRouter.get(
    '/:id',
    validationSchema(getProveedor, 'params'),
    getProveedorController
);

proveedorRouter.post(
    '/',
    validationSchema(createProveedor, 'body'),
    createProveedorController
);

proveedorRouter.patch(
    '/:id',
    validationSchema(getProveedor, 'params'),
    validationSchema(updateProveedor, 'body'),
    updateProveedorController
);

module.exports = { proveedorRouter };