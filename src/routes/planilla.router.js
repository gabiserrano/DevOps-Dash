const { Router } = require('express');
const passport = require('passport');
const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handle');
const {
    generarPlanilla,
    updateDetallePlanilla,
    cambiarEstadoPlanilla,
    getPlanilla,
    queryPlanilla,
} = require('../schemas/planilla.schema');
const {
    getPlanillasController,
    getPlanillaController,
    generarPlanillaController,
    updateDetallePlanillaController,
    cambiarEstadoPlanillaController,
} = require('../controllers/planilla.controller');

const planillaRouter = Router();

// Todas las rutas de planilla requieren JWT y rol 'admin' o 'gerente'
planillaRouter.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'gerente')
);

planillaRouter.get(
    '/',
    validationSchema(queryPlanilla, 'query'),
    getPlanillasController
);

planillaRouter.get(
    '/:id',
    validationSchema(getPlanilla, 'params'),
    getPlanillaController
);

planillaRouter.post(
    '/generar',
    validationSchema(generarPlanilla, 'body'),
    generarPlanillaController
);

planillaRouter.patch(
    '/detalle/:id',
    validationSchema(getPlanilla, 'params'),
    validationSchema(updateDetallePlanilla, 'body'),
    updateDetallePlanillaController
);

planillaRouter.patch(
    '/:id/estado',
    validationSchema(getPlanilla, 'params'),
    validationSchema(cambiarEstadoPlanilla, 'body'),
    cambiarEstadoPlanillaController
);

module.exports = { planillaRouter };