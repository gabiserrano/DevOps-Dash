const { Router } = require('express');
const { validationSchema } = require('../middlewares/validation.schema');
const { productoRouter } = require('./producto.router');

const RouterApi = (app) => {
    const router = Router();
    router.use("/producto", productoRouter)
    app.use('/api/v1', router);
};

module.exports = { RouterApi };