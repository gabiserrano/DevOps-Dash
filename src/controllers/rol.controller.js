const { RolService } = require('../services/rol.service');

const service = new RolService();

const getRolesController = async (req, res, next) => {
    try {
        res.json(await service.findAll(req.query));
    } catch (err) {
        next(err);
    }
};

const getRolController = async (req, res, next) => {
    try {
        res.json(await service.findOne(req.params.id));
    } catch (err) {
        next(err);
    }
};

const createRolController = async (req, res, next) => {
    try {
        res.status(201).json(await service.create(req.body));
    } catch (err) {
        next(err);
    }
};

const updateRolController = async (req, res, next) => {
    try {
        res.json(await service.update(req.params.id, req.body));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getRolesController,
    getRolController,
    createRolController,
    updateRolController
};
