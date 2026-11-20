const { Router } = require('express');
const passport = require('passport');

const { getMetodosPagoController } = require('../controllers/metodoPago.controller');

const metodoPagoRouter = Router();

// Catálogo de métodos de pago para el POS.
metodoPagoRouter.use(passport.authenticate('jwt', { session: false }));

metodoPagoRouter.get('/', getMetodosPagoController);

module.exports = { metodoPagoRouter };
