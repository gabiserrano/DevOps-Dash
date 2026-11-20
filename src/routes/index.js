const { Router } = require('express');
const { authRouter } = require('./auth.router');
const { productoRouter } = require('./producto.router');
const ventaRouter = require('./venta.router');
const { clienteRouter } = require('./cliente.router');
const comprasRoutes = require('./compra.router');
const { insumoRouter } = require('./insumo.router');
const { recetaRouter } = require('./receta.router');
const { sucursalRouter } = require('./sucursal.router');
const { proveedorRouter } = require('./proveedor.router');
const { cajaRouter } = require('./caja.router');
const { inventarioRouter } = require('./inventario.router');
const { empleadoRouter } = require('./empleado.router');
const { planillaRouter } = require('./planilla.router');
const { rolRouter } = require('./rol.router');
const { usuarioRouter } = require('./usuario.router');

const RouterApi = (app) => {
    const router = Router();

    router.use('/auth', authRouter);
    router.use('/roles', rolRouter);
    router.use('/usuarios', usuarioRouter);
    router.use('/producto', productoRouter);
    router.use('/ventas', ventaRouter);
    router.use('/clientes', clienteRouter);
    router.use('/compras', comprasRoutes);
    router.use('/insumos', insumoRouter);
    router.use('/recetas', recetaRouter);
    router.use('/sucursal', sucursalRouter);
    router.use('/proveedor', proveedorRouter);
    router.use('/caja', cajaRouter);
    router.use('/inventario', inventarioRouter);
    router.use('/empleado', empleadoRouter);
    router.use('/planilla', planillaRouter)
    app.use('/api/v1', router);
};

module.exports = { RouterApi };
