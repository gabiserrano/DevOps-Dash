const { Router } = require('express');
const { productoRouter } = require('./producto.router');
const ventaRouter = require('./venta.router');

const RouterApi = (app) => {
    const router = Router();

    router.use('/producto', productoRouter);
    router.use('/ventas', ventaRouter);

    app.use('/api/v1', router);
};

module.exports = { RouterApi };
