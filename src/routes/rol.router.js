const { Router } = require('express');
const passport = require('passport');

const { checkRoles } = require('../middlewares/auth.handle');
const { validationSchema } = require('../middlewares/validation.schema');

const {
    createRol,
    updateRol,
    getRol,
    queryRol
} = require('../schemas/rol.schema');

const {
    getRolesController,
    getRolController,
    createRolController,
    updateRolController
} = require('../controllers/rol.controller');

const rolRouter = Router();

rolRouter.use(
    passport.authenticate('jwt', { session: false })
);

rolRouter.get(
    '/',
    validationSchema(queryRol, 'query'),
    getRolesController
);

rolRouter.get(
    '/:id',
    validationSchema(getRol, 'params'),
    getRolController
);

rolRouter.post(
    '/',
    checkRoles('gerente'),
    validationSchema(createRol, 'body'),
    createRolController
);

rolRouter.patch(
    '/:id',
    checkRoles('gerente'),
    validationSchema(getRol, 'params'),
    validationSchema(updateRol, 'body'),
    updateRolController
);

module.exports = { rolRouter };
