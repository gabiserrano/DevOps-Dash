
const { Router } = require('express');

const { validationSchema } = require('../middlewares/validation.schema');

const {
    upsertReceta,
    updateRecetaItem,
    getReceta,
    getRecetaByProducto
} = require('../schemas/receta.schema');

const recetaController = require('../controllers/receta.controller');

const recetaRouter = Router();

recetaRouter.get(
    '/producto/:productoId',
    validationSchema(getRecetaByProducto, 'params'),
    recetaController.obtenerPorProducto
);


recetaRouter.post(
    '/',
    validationSchema(upsertReceta, 'body'),
    recetaController.crear
);


recetaRouter.patch(
    '/:id',
    validationSchema(getReceta, 'params'),
    validationSchema(updateRecetaItem, 'body'),
    recetaController.actualizar
);


recetaRouter.delete(
    '/:id',
    validationSchema(getReceta, 'params'),
    recetaController.eliminar
);

module.exports = { recetaRouter };
