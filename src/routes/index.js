const { Router } = require('express');

const { productoRouter } = require('./producto.router');
const ventaRouter = require('./venta.router');
const { clienteRouter } = require('./cliente.router');

const RouterApi = (app) => {
    const router = Router();

    router.use('/producto', productoRouter);
    router.use('/ventas', ventaRouter);
    router.use('/clientes', clienteRouter);

    app.use('/api/v1', router);
};

module.exports = { RouterApi };
