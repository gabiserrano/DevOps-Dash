const { InventarioService } = require('../services/inventario.service');

const service = new InventarioService();

const getInventariosController = async (req, res, next) => {
    try {
        const inventarios = await service.findAll(req.query);
        res.status(200).json({
            data: inventarios,
        });
    } catch (error) {
        next(error);
    }
};

const getMovimientosInventarioController = async (req, res, next) => {
    try {
        const movimientos = await service.findMovimientos(req.query);
        res.status(200).json({
            data: movimientos,
        });
    } catch (error) {
        next(error);
    }
};

const updateStockMinimoController = async (req, res, next) => {
    try {
        const inventario = await service.updateStockMinimo(req.params.id, req.body);
        res.status(200).json({
            message: 'Stock mínimo actualizado exitosamente',
            data: inventario,
        });
    } catch (error) {
        next(error);
    }
};

const setStockMinimoController = async (req, res, next) => {
    try {
        const inventario = await service.setStockMinimo(req.body);
        res.status(200).json({
            message: 'Stock mínimo configurado exitosamente',
            data: inventario,
        });
    } catch (error) {
        next(error);
    }
};

const registrarAjusteInventarioController = async (req, res, next) => {
    try {
        const usuarioId = req.user.sub;
        const inventario = await service.registrarAjuste(req.body, usuarioId);
        res.status(201).json({
            message: 'Ajuste de inventario registrado exitosamente',
            data: inventario,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInventariosController,
    getMovimientosInventarioController,
    updateStockMinimoController,
    setStockMinimoController,
    registrarAjusteInventarioController,
};