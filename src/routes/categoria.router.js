const { Router } = require('express');
const passport = require('passport');

const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handle');
const categoriaController = require('../controllers/categoria.controller');
const { createCategoria, updateCategoria, getCategoria, queryCategoria } = require('../schemas/categoria.schema');

const categoriaRouter = Router();

categoriaRouter.use(passport.authenticate('jwt', { session: false }));

categoriaRouter.get('/', validationSchema(queryCategoria, 'query'), categoriaController.listar);

categoriaRouter.post(
    '/',
    checkRoles('admin', 'gerente'),
    validationSchema(createCategoria, 'body'),
    categoriaController.crear
);

categoriaRouter.patch(
    '/:id',
    checkRoles('admin', 'gerente'),
    validationSchema(getCategoria, 'params'),
    validationSchema(updateCategoria, 'body'),
    categoriaController.actualizar
);

categoriaRouter.delete(
    '/:id',
    checkRoles('admin', 'gerente'),
    validationSchema(getCategoria, 'params'),
    categoriaController.eliminar
);

module.exports = { categoriaRouter };
