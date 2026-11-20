
const { Router } = require('express');
const passport = require('passport');

const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handle');

const {
    upsertReceta,
    updateRecetaItem,
    getReceta,
    getRecetaByProducto
} = require('../schemas/receta.schema');

const recetaController = require('../controllers/receta.controller');

const recetaRouter = Router();

// Recetas: preparación de productos (barista) y supervisión.
recetaRouter.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'gerente', 'barista', 'compras')
);

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
