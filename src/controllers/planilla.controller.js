const { PlanillaService } = require('../services/planilla.service');

const service = new PlanillaService();

const getPlanillasController = async (req, res, next) => {
    try {
        const planillas = await service.findAll(req.query);
        res.status(200).json({
            data: planillas,
        });
    } catch (error) {
        next(error);
    }
};

const getPlanillaController = async (req, res, next) => {
    try {
        const planilla = await service.findOne(req.params.id);
        res.status(200).json({
            data: planilla,
        });
    } catch (error) {
        next(error);
    }
};

const generarPlanillaController = async (req, res, next) => {
    try {
        const nuevaPlanilla = await service.generar(req.body);
        res.status(201).json({
            message: 'Planilla quincenal generada exitosamente',
            data: nuevaPlanilla,
        });
    } catch (error) {
        next(error);
    }
};

const updateDetallePlanillaController = async (req, res, next) => {
    try {
        const planillaActualizada = await service.updateDetalle(req.params.id, req.body);
        res.status(200).json({
            message: 'Deducción actualizada exitosamente',
            data: planillaActualizada,
        });
    } catch (error) {
        next(error);
    }
};

const cambiarEstadoPlanillaController = async (req, res, next) => {
    try {
        const planillaActualizada = await service.cambiarEstado(req.params.id, req.body.estado);
        res.status(200).json({
            message: `Estado de planilla actualizado a "${req.body.estado}"`,
            data: planillaActualizada,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPlanillasController,
    getPlanillaController,
    generarPlanillaController,
    updateDetallePlanillaController,
    cambiarEstadoPlanillaController,
};