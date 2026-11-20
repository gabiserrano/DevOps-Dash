const { CajaService } = require('../services/caja.service');

const service = new CajaService();

const getCajasController = async (req, res, next) => {
    try {
        const cajas = await service.findAll(req.query);
        res.status(200).json({
            data: cajas,
        });
    } catch (error) {
        next(error);
    }
};

const getCajaController = async (req, res, next) => {
    try {
        const caja = await service.findOne(req.params.id);
        res.status(200).json({
            data: caja,
        });
    } catch (error) {
        next(error);
    }
};

const getCajaAbiertaSucursalController = async (req, res, next) => {
    try {
        const caja = await service.findAbiertaPorSucursal(req.params.sucursalId);
        res.status(200).json({
            data: caja,
        });
    } catch (error) {
        next(error);
    }
};

const abrirCajaController = async (req, res, next) => {
    try {
        const usuarioId = req.user.sub;
        const caja = await service.abrir(req.body, usuarioId);
        res.status(201).json({
            message: 'Caja abierta exitosamente',
            data: caja,
        });
    } catch (error) {
        next(error);
    }
};

const registrarMovimientoCajaController = async (req, res, next) => {
    try {
        const usuarioId = req.user.sub;
        const movimiento = await service.registrarMovimiento(req.params.id, req.body, usuarioId);
        res.status(201).json({
            message: 'Movimiento de caja registrado exitosamente',
            data: movimiento,
        });
    } catch (error) {
        next(error);
    }
};

const cerrarCajaController = async (req, res, next) => {
    try {
        const usuarioId = req.user.sub;
        const cajaCerrada = await service.cerrar(req.params.id, req.body, usuarioId);
        res.status(200).json({
            message: 'Caja cerrada y arqueada exitosamente',
            data: cajaCerrada,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCajasController,
    getCajaController,
    getCajaAbiertaSucursalController,
    abrirCajaController,
    registrarMovimientoCajaController,
    cerrarCajaController,
};