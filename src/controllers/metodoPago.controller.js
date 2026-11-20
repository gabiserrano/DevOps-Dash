const { MetodoPagoService } = require('../services/metodoPago.service');

const service = new MetodoPagoService();

const getMetodosPagoController = async (_req, res, next) => {
    try {
        const metodos = await service.findAll();
        res.status(200).json({ data: metodos });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMetodosPagoController };
