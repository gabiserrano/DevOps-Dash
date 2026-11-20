const { Router } = require('express');
const { productoRouter } = require('./producto.router');
const ventaRouter = require('./venta.router');
const comprasRoutes = require('./compra.router');


const RouterApi = (app) => {
    const router = Router();

    router.use('/producto', productoRouter);
    router.use('/ventas', ventaRouter);
    router.use('/compras', comprasRoutes);


    app.use('/api/v1', router);
};

module.exports = { RouterApi };
