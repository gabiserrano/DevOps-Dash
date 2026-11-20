const { Router } = require('express');

const { productoRouter } = require('./producto.router');
const ventaRouter = require('./venta.router');
const { clienteRouter } = require('./cliente.router');
const comprasRoutes = require('./compra.router');
const { sucursalRouter } = require('./sucursal.router');
const { authRouter } = require('./auth.router');

const RouterApi = (app) => {
    const router = Router();

    router.use('/auth', authRouter);
    router.use('/producto', productoRouter);
    router.use('/ventas', ventaRouter);
    router.use('/clientes', clienteRouter);
    router.use('/compras', comprasRoutes);
    router.use('/sucursales', sucursalRouter);

    app.use('/api/v1', router);
};

module.exports = { RouterApi };

