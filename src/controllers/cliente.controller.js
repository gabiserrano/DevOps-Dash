
const { ClienteService } = require('../services/cliente.service');

const service = new ClienteService();

const getClientesController = async (req, res, next) => {
    try {
        const clientes = await service.findAll(req.query);
        res.json(clientes);
    } catch (error) {
        next(error);
    }
};

const getClienteController = async (req, res, next) => {
    try {
        const cliente = await service.findOne(req.params.id);
        res.json(cliente);
    } catch (error) {
        next(error);
    }
};

const createClienteController = async (req, res, next) => {
    try {
        const cliente = await service.create(req.body);
        res.status(201).json(cliente);
    } catch (error) {
        next(error);
    }
};

const updateClienteController = async (req, res, next) => {
    try {
        const cliente = await service.update(req.params.id, req.body);
        res.json(cliente);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getClientesController,
    getClienteController,
    createClienteController,
    updateClienteController,
};
