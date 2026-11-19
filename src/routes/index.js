const { Router } = require('express');
const { validationSchema } = require('../middlewares/validation.schema');

const RouterApi = (app) => {
    const router = Router();
    // agregar routers aca
    app.use('/api/v1', router);
};

module.exports = { RouterApi };