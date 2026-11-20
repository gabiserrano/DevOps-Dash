const { Op } = require('sequelize');
const { HttpError } = require('./httpError.helper');
const {
    escalarDesdeBd,
    cantidadATexto,
    costoATexto,
    redondearPositivo,
} = require('./math.helper');

/**
 * Calcula el consumo total de insumos (escala 10^3) para los detalles de una venta,
 * resolviendo tanto productos de reventa como recetas de productos elaborados.
 */
async function calcularConsumoVenta(models, detalles, transaction) {
    const productoIds = [...new Set(detalles.map((d) => d.productoId))];

    const productos = await models.Producto.findAll({
        where: { id: { [Op.in]: productoIds } },
        include: [{ association: 'receta' }],
        transaction,
    });

    if (productos.length !== productoIds.length) {
        throw new HttpError(404, 'Uno o más productos de la venta no existen');
    }

    const productosMap = new Map(productos.map((p) => [p.id, p]));
    const consumoPorInsumo = new Map(); // insumoId -> BigInt (escala 10^3)

    const acumular = (insumoId, cantidadEscalada) => {
        const actual = consumoPorInsumo.get(insumoId) || 0n;
        consumoPorInsumo.set(insumoId, actual + cantidadEscalada);
    };

    for (const detalle of detalles) {
        const producto = productosMap.get(detalle.productoId);
        const unidadesVendidas = BigInt(detalle.cantidad);

        if (!producto.activo) {
            throw new HttpError(400, `El producto "${producto.nombre}" está inactivo`);
        }

        if (producto.tipo === 'reventa') {
            if (!producto.insumoId) {
                throw new HttpError(400, `El producto de reventa "${producto.nombre}" no tiene insumo vinculado`);
            }
            // 1 unidad vendida = 1.000 en escala 10^3
            acumular(producto.insumoId, unidadesVendidas * 1000n);
        } else if (producto.tipo === 'elaborado') {
            if (!producto.receta || producto.receta.length === 0) {
                throw new HttpError(400, `El producto elaborado "${producto.nombre}" no tiene receta configurada`);
            }
            for (const item of producto.receta) {
                const cantidadReceta = escalarDesdeBd(item.cantidad, 3);
                acumular(item.insumoId, cantidadReceta * unidadesVendidas);
            }
        }
    }

    return consumoPorInsumo;
}

/**
 * Registra una entrada por compra: actualiza costo promedio ponderado en Insumo,
 * suma stock en Inventario (findOrCreate + update) y crea el kardex en MovimientoInventario.
 */
async function registrarEntradaCompra(models, { sucursalId, insumo, cantidadEscalada, costoUnitarioEscalado, compraId, usuarioId }, transaction) {
    // 1. Stock global previo con ORM (.sum) para recalcular costo promedio ponderado
    const stockGlobalPrevio = await models.Inventario.sum('stockActual', {
        where: { insumoId: insumo.id },
        transaction,
    });

    const stockAnterior = escalarDesdeBd(stockGlobalPrevio, 3);
    const costoAnterior = escalarDesdeBd(insumo.costoPromedio, 4);
    const nuevoStockGlobal = stockAnterior + cantidadEscalada;

    if (nuevoStockGlobal > 0n) {
        const numerador = stockAnterior * costoAnterior + cantidadEscalada * costoUnitarioEscalado;
        const nuevoCostoPromedio = redondearPositivo(numerador, nuevoStockGlobal);

        await insumo.update(
            { costoPromedio: costoATexto(nuevoCostoPromedio) },
            { transaction }
        );
    }

    // 2. Obtener o crear registro de inventario de la sucursal con bloqueo
    const [inventario] = await models.Inventario.findOrCreate({
        where: { sucursalId, insumoId: insumo.id },
        defaults: {
            sucursalId,
            insumoId: insumo.id,
            stockActual: '0.000',
            stockMinimo: '0.000',
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    const stockSucursalActual = escalarDesdeBd(inventario.stockActual, 3);
    const nuevoStockSucursal = stockSucursalActual + cantidadEscalada;

    await inventario.update(
        {
            stockActual: cantidadATexto(nuevoStockSucursal),
            actualizadoEn: new Date(),
        },
        { transaction }
    );

    // 3. Registrar movimiento en kardex
    await models.MovimientoInventario.create(
        {
            sucursalId,
            insumoId: insumo.id,
            tipo: 'entrada',
            cantidad: cantidadATexto(cantidadEscalada),
            motivo: 'compra',
            referenciaId: compraId,
            usuarioId,
        },
        { transaction }
    );
}

/**
 * Valida stock disponible y descuenta del inventario de la sucursal generando kardex.
 */
async function descontarSalidaVenta(models, { sucursalId, consumoPorInsumo, ventaId, usuarioId }, transaction) {
    const insumoIds = [...consumoPorInsumo.keys()];

    const inventarios = await models.Inventario.findAll({
        where: {
            sucursalId,
            insumoId: { [Op.in]: insumoIds },
        },
        include: [{ association: 'insumo', attributes: ['id', 'nombre', 'unidad'], required: true }],
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    const inventarioMap = new Map(inventarios.map((inv) => [inv.insumoId, inv]));

    // Validar disponibilidad completa antes de modificar cualquier fila
    for (const [insumoId, requerido] of consumoPorInsumo.entries()) {
        const inv = inventarioMap.get(insumoId);
        const disponible = inv ? escalarDesdeBd(inv.stockActual, 3) : 0n;

        if (!inv || disponible < requerido) {
            const nombreInsumo = inv?.insumo?.nombre || `ID ${insumoId}`;
            throw new HttpError(400, `Stock insuficiente para el insumo "${nombreInsumo}" en esta sucursal`);
        }
    }

    // Descontar y crear kardex
    for (const [insumoId, requerido] of consumoPorInsumo.entries()) {
        const inv = inventarioMap.get(insumoId);
        const nuevoStock = escalarDesdeBd(inv.stockActual, 3) - requerido;

        await inv.update(
            {
            stockActual: cantidadATexto(nuevoStock),
            actualizadoEn: new Date(),
        },
            { transaction }
        );

        await models.MovimientoInventario.create(
            {
                sucursalId,
                insumoId,
                tipo: 'salida',
                cantidad: cantidadATexto(requerido),
                motivo: 'venta',
                referenciaId: ventaId,
                usuarioId,
            },
            { transaction }
        );
    }
}

/**
 * Revierte el stock al inventario cuando se anula una venta.
 */
async function devolverStockAnulacion(models, { sucursalId, consumoPorInsumo, ventaId, usuarioId }, transaction) {
    const insumoIds = [...consumoPorInsumo.keys()];

    const inventarios = await models.Inventario.findAll({
        where: {
            sucursalId,
            insumoId: { [Op.in]: insumoIds },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    const inventarioMap = new Map(inventarios.map((inv) => [inv.insumoId, inv]));

    for (const [insumoId, devolver] of consumoPorInsumo.entries()) {
        const inv = inventarioMap.get(insumoId);
        if (inv) {
            const nuevoStock = escalarDesdeBd(inv.stockActual, 3) + devolver;
            await inv.update(
                {
            stockActual: cantidadATexto(nuevoStock),
            actualizadoEn: new Date(),
        },
                { transaction }
            );
        }

        await models.MovimientoInventario.create(
            {
                sucursalId,
                insumoId,
                tipo: 'entrada',
                cantidad: cantidadATexto(devolver),
                motivo: 'anulacion_venta',
                referenciaId: ventaId,
                usuarioId,
            },
            { transaction }
        );
    }
}

module.exports = {
    calcularConsumoVenta,
    registrarEntradaCompra,
    descontarSalidaVenta,
    devolverStockAnulacion,
};