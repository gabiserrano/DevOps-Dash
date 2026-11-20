const { ProveedorService } = require('../services/proveedor.service');

const service = new ProveedorService();

const getProveedoresController = async (req, res, next) => {
    try {
        const proveedores = await service.findAll(req.query);
        res.status(200).json({
            data: proveedores,
        });
    } catch (error) {
        next(error);
    }
};

const getProveedorController = async (req, res, next) => {
    try {
        const proveedor = await service.findOne(req.params.id);
        res.status(200).json({
            data: proveedor,
        });
    } catch (error) {
        next(error);
    }
};

const createProveedorController = async (req, res, next) => {
    try {
        const nuevoProveedor = await service.create(req.body);
        res.status(201).json({
            message: 'Proveedor creado exitosamente',
            data: nuevoProveedor,
        });
    } catch (error) {
        next(error);
    }
};

const updateProveedorController = async (req, res, next) => {
    try {
        const proveedorActualizado = await service.update(req.params.id, req.body);
        res.status(200).json({
            message: 'Proveedor actualizado exitosamente',
            data: proveedorActualizado,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProveedoresController,
    getProveedorController,
    createProveedorController,
    updateProveedorController,
};