
const { SucursalService } = require('../services/sucursal.service');

const service = new SucursalService();

const getSucursalesController = async (req, res, next) => {
    try {
        const sucursales = await service.findAll();
        res.json(sucursales);
    } catch (error) {
        next(error);
    }
};

const getSucursalController = async (req, res, next) => {
    try {
        const sucursal = await service.findOne(req.params.id);
        res.json(sucursal);
    } catch (error) {
        next(error);
    }
};

const createSucursalController = async (req, res, next) => {
    try {
        const sucursal = await service.create(req.body);
        res.status(201).json(sucursal);
    } catch (error) {
        next(error);
    }
};

const updateSucursalController = async (req, res, next) => {
    try {
        const sucursal = await service.update(req.params.id, req.body);
        res.json(sucursal);
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
