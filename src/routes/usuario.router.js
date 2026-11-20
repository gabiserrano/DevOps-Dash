const { Router } = require('express');
const passport = require('passport');

const { checkRoles } = require('../middlewares/auth.handle');
const { validationSchema } = require('../middlewares/validation.schema');

const {
    createUsuario,
    updateUsuario,
    getUsuario,
    queryUsuario
} = require('../schemas/usuario.schema');

const {
    getUsuariosController,
    getUsuarioController,
    createUsuarioController,
    updateUsuarioController
} = require('../controllers/usuario.controller');

const usuarioRouter = Router();

usuarioRouter.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'gerente')
);

usuarioRouter.get(
    '/',
    validationSchema(queryUsuario, 'query'),
    getUsuariosController
);

usuarioRouter.get(
    '/:id',
    validationSchema(getUsuario, 'params'),
    getUsuarioController
);

usuarioRouter.post(
    '/',
    validationSchema(createUsuario, 'body'),
    createUsuarioController
);

usuarioRouter.patch(
    '/:id',
    validationSchema(getUsuario, 'params'),
    validationSchema(updateUsuario, 'body'),
    updateUsuarioController
);

module.exports = { usuarioRouter };
