
const express = require('express');
const passport = require('passport');

const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handle');

const {
    createInsumo,
    updateInsumo,
    getInsumo,
    queryInsumo
} = require('../schemas/insumo.schema');

const insumoController = require('../controllers/insumo.controller');

const insumoRouter = express.Router();

// Catálogo de insumos: abastecimiento e inventario.
insumoRouter.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'gerente', 'compras', 'barista')
);

insumoRouter.get(
    '/',
    validationSchema(queryInsumo, 'query'),
    insumoController.listar
);

insumoRouter.get(
    '/:id',
    validationSchema(getInsumo, 'params'),
    insumoController.obtener
);

insumoRouter.post(
    '/',
    validationSchema(createInsumo, 'body'),
    insumoController.crear
);

insumoRouter.patch(
    '/:id',
    validationSchema(getInsumo, 'params'),
    validationSchema(updateInsumo, 'body'),
    insumoController.actualizar
);

module.exports = { insumoRouter };
