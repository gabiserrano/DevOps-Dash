
const { Router } = require('express');
const passport = require('passport');

const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handle');

const {
    createCliente,
    updateCliente,
    getCliente,
    queryCliente,
} = require('../schemas/cliente.schema');

const {
    getClientesController,
    getClienteController,
    createClienteController,
    updateClienteController,
} = require('../controllers/cliente.controller');

const clienteRouter = Router();

// Clientes: caja y supervisión (facturación con CCF).
clienteRouter.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'gerente', 'cajero')
);

clienteRouter.get(
    '/',
    validationSchema(queryCliente, 'query'),
    getClientesController
);

clienteRouter.get(
    '/:id',
    validationSchema(getCliente, 'params'),
    getClienteController
);

clienteRouter.post(
    '/',
    validationSchema(createCliente, 'body'),
    createClienteController
);

clienteRouter.patch(
    '/:id',
    validationSchema(getCliente, 'params'),
    validationSchema(updateCliente, 'body'),
    updateClienteController
);

module.exports = { clienteRouter };
