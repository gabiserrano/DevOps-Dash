
const { InsumoService } = require('../services/insumo.service');

const service = new InsumoService();

// GET / - Listar y buscar insumos
const listar = async (req, res, next) => {
    try {
        const insumos = await service.findAll(req.query);

        return res.status(200).json(insumos);
    } catch (error) {
        next(error);
    }
};

// GET /:id - Obtener un insumo por ID
const obtener = async (req, res, next) => {
    try {
        const { id } = req.params;

        const insumo = await service.findOne(id);

        return res.status(200).json(insumo);
    } catch (error) {
        next(error);
    }
};

// POST / - Crear un insumo
const crear = async (req, res, next) => {
    try {
        const nuevoInsumo = await service.create(req.body);

        return res.status(201).json(nuevoInsumo);
    } catch (error) {
        next(error);
    }
};

// PATCH /:id - Actualizar un insumo
const actualizar = async (req, res, next) => {
    try {
        const { id } = req.params;

        const insumoActualizado = await service.update(id, req.body);

        return res.status(200).json(insumoActualizado);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listar,
    obtener,
    crear,
    actualizar,
};
