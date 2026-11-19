
const { Router } = require('express');

const { validationSchema } = require('../../middlewares/validation.schema');

const {
  crearSchema,
  actualizarSchema,
  idSchema,
  listarSchema
} = require('./productos.schema');

const ctrl = require('./productos.controller');

const router = Router();

router.get(
  '/',
  validationSchema(listarSchema, 'query'),
  ctrl.listar
);

router.get(
  '/:id',
  validationSchema(idSchema, 'params'),
  ctrl.obtener
);

router.post(
  '/',
  validationSchema(crearSchema, 'body'),
  ctrl.crear
);

router.patch(
  '/:id',
  validationSchema(idSchema, 'params'),
  validationSchema(actualizarSchema, 'body'),
  ctrl.actualizar
);

router.delete(
  '/:id',
  validationSchema(idSchema, 'params'),
  ctrl.desactivar
);

module.exports = router;
