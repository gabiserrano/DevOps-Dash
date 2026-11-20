const { CategoriaService } = require('../services/categoria.service');

const service = new CategoriaService();

const listar = async (req, res, next) => {
    try {
        res.status(200).json({ data: await service.findAll(req.query) });
    } catch (error) {
        next(error);
    }
};

const crear = async (req, res, next) => {
    try {
        res.status(201).json({ data: await service.create(req.body) });
    } catch (error) {
        next(error);
    }
};

const actualizar = async (req, res, next) => {
    try {
        res.status(200).json({ data: await service.update(req.params.id, req.body) });
    } catch (error) {
        next(error);
    }
};

const eliminar = async (req, res, next) => {
    try {
        res.status(200).json(await service.delete(req.params.id));
    } catch (error) {
        next(error);
    }
};

module.exports = { listar, crear, actualizar, eliminar };
