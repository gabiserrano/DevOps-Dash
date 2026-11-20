const { Router } = require('express');

const { rolRouter } = require('./rol.router');
const { usuarioRouter } = require('./usuario.router');

const RouterApi = (app) => {
  const router = Router();

  router.use('/roles', rolRouter);
  router.use('/usuarios', usuarioRouter);

  app.use('/api/v1', router);
};

module.exports = { RouterApi };