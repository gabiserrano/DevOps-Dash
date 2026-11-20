
const { VentaService } = require('../services/venta.service');

const service = new VentaService();


const getVentasController = async (req, res, next) => {
    try {
        const ventas = await service.findAll(req.query);
        res.status(200).json(ventas);
    } catch (error) {
        next(error);
    }
};


const getVentaController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const venta = await service.findOne(id);
        res.status(200).json(venta);
    } catch (error) {
        next(error);
    }
};


const createVentaController = async (req, res, next) => {
    try {
        const venta = await service.create(req.body);
        res.status(201).json(venta);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVentasController,
    getVentaController,
    createVentaController,
};
