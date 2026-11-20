
const { Router } = require('express');
const { validationSchema } = require('../middlewares/validation.schema');

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
