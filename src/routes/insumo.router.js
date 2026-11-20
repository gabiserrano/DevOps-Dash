
const express = require('express');

const { validationSchema } = require('../middlewares/validation.schema');

const {
    createInsumo,
    updateInsumo,
    getInsumo,
    queryInsumo
} = require('../schemas/insumo.schema');

const insumoController = require('../controllers/insumo.controller');

const insumoRouter = express.Router();

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
