const { Router } = require('express');
const controller = require('./caja.controller');

const router = Router();

router.post('/apertura', controller.abrir);
router.get('/abierta/:usuarioId', controller.obtenerAbierta);

module.exports = router;