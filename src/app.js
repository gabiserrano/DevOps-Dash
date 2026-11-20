const express = require('express');
const cors = require('cors');
const { RouterApi } = require('./routes');
const { handlerConsoleError, handlerOrmError, handlerErrorServer } = require('./middlewares/error.handle');

const createApp = () => {
    const app = express();

    app.use(cors());
    app.use(express.json());

    require("./utils")

    app.get('/', (_req, res) => {
        res.status(200).json({
            Greeting: 'Hello my RestApi',
        });
    });

    RouterApi(app);
    app.use(handlerConsoleError);
    app.use(handlerOrmError);
    app.use(handlerErrorServer);

    return app;
};

module.exports = { createApp };