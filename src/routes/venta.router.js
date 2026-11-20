
const express = require('express');

const {
    getVentasController,
    getVentaController,
    createVentaController,
} = require('../controllers/venta.controller');

const {
    createVenta,
    getVenta,
    queryVenta,
} = require('../schemas/venta.schema');

const {
    validationSchema,
} = require('../middlewares/validation.schema');

const router = express.Router();

router.get(
    '/',
    validationSchema(queryVenta, 'query'),
    getVentasController
);

router.get(
    '/:id',
    validationSchema(getVenta, 'params'),
    getVentaController
);

router.post(
    '/',
    validationSchema(createVenta, 'body'),
    createVentaController
);

module.exports = router;
