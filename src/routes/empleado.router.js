const { Router } = require('express');
const passport = require('passport');
const { validationSchema } = require('../middlewares/validation.schema');
const { checkRoles } = require('../middlewares/auth.handler');
const {
    createEmpleado,
    updateEmpleado,
    getEmpleado,
    queryEmpleado,
} = require('../schemas/empleado.schema');
const {
    getEmpleadosController,
    getEmpleadoController,
    createEmpleadoController,
    updateEmpleadoController,
} = require('../controllers/empleado.controller');

const empleadoRouter = Router();

// Todas las rutas de empleados requieren JWT y rol 'admin' o 'gerente'
empleadoRouter.use(
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'gerente')
);

empleadoRouter.get(
    '/',
    validationSchema(queryEmpleado, 'query'),
    getEmpleadosController
);

empleadoRouter.get(
    '/:id',
    validationSchema(getEmpleado, 'params'),
    getEmpleadoController
);

empleadoRouter.post(
    '/',
    validationSchema(createEmpleado, 'body'),
    createEmpleadoController
);

empleadoRouter.patch(
    '/:id',
    validationSchema(getEmpleado, 'params'),
    validationSchema(updateEmpleado, 'body'),
    updateEmpleadoController
);

module.exports = { empleadoRouter };