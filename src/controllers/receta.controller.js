
const { RecetaService } = require('../services/receta.service');

const service = new RecetaService();


const obtenerPorProducto = async (req, res, next) => {
    try {
        const { productoId } = req.params;

        const receta = await service.findByProducto(productoId);

        return res.status(200).json(receta);
    } catch (error) {
        next(error);
    }
};


const crear = async (req, res, next) => {
    try {
        const receta = await service.create(req.body);

        return res.status(201).json(receta);
    } catch (error) {
        next(error);
    }
};


const actualizar = async (req, res, next) => {
    try {
        const { id } = req.params;

        const ingrediente = await service.update(id, req.body);

        return res.status(200).json(ingrediente);
    } catch (error) {
        next(error);
    }
};


const eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado = await service.delete(id);

        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerPorProducto,
    crear,
    actualizar,
    eliminar
};
