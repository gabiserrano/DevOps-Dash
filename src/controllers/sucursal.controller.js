const { SucursalService } = require('../services/sucursal.service');

const service = new SucursalService();

const getSucursalesController = async (req, res, next) => {
    try {
        const sucursales = await service.findAll(req.query);
        res.status(200).json({
            data: sucursales,
        });
    } catch (error) {
        next(error);
    }
};

const getSucursalController = async (req, res, next) => {
    try {
        const sucursal = await service.findOne(req.params.id);
        res.status(200).json({
            data: sucursal,
        });
    } catch (error) {
        next(error);
    }
};

const createSucursalController = async (req, res, next) => {
    try {
        const nuevaSucursal = await service.create(req.body);
        res.status(201).json({
            message: 'Sucursal creada exitosamente',
            data: nuevaSucursal,
        });
    } catch (error) {
        next(error);
    }
};

const updateSucursalController = async (req, res, next) => {
    try {
        const sucursalActualizada = await service.update(req.params.id, req.body);
        res.status(200).json({
            message: 'Sucursal actualizada exitosamente',
            data: sucursalActualizada,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSucursalesController,
    getSucursalController,
    createSucursalController,
    updateSucursalController,
};