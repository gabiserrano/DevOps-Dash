const { UsuarioService } = require('../services/usuario.service');

const service = new UsuarioService();

const getUsuariosController = async (req, res, next) => {
    try {
        res.json(await service.findAll(req.query));
    } catch (err) {
        next(err);
    }
};

const getUsuarioController = async (req, res, next) => {
    try {
        res.json(await service.findOne(req.params.id));
    } catch (err) {
        next(err);
    }
};

const createUsuarioController = async (req, res, next) => {
    try {
        res.status(201).json(await service.create(req.body));
    } catch (err) {
        next(err);
    }
};

const updateUsuarioController = async (req, res, next) => {
    try {
        res.json(await service.update(req.params.id, req.body));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUsuariosController,
    getUsuarioController,
    createUsuarioController,
    updateUsuarioController
};
