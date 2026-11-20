const { EmpleadoService } = require('../services/empleado.service');

const service = new EmpleadoService();

const getEmpleadosController = async (req, res, next) => {
    try {
        const empleados = await service.findAll(req.query);
        res.status(200).json({
            data: empleados,
        });
    } catch (error) {
        next(error);
    }
};

const getEmpleadoController = async (req, res, next) => {
    try {
        const empleado = await service.findOne(req.params.id);
        res.status(200).json({
            data: empleado,
        });
    } catch (error) {
        next(error);
    }
};

const createEmpleadoController = async (req, res, next) => {
    try {
        const nuevoEmpleado = await service.create(req.body);
        res.status(201).json({
            message: 'Empleado creado exitosamente',
            data: nuevoEmpleado,
        });
    } catch (error) {
        next(error);
    }
};

const updateEmpleadoController = async (req, res, next) => {
    try {
        const empleadoActualizado = await service.update(req.params.id, req.body);
        res.status(200).json({
            message: 'Empleado actualizado exitosamente',
            data: empleadoActualizado,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmpleadosController,
    getEmpleadoController,
    createEmpleadoController,
    updateEmpleadoController,
};