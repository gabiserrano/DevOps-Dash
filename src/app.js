const express = require('express');
const { RouterApi } = require("./routes");

const createApp = () => {
    const app = express();

    app.use(express.json());

    app.get('/', (_req, res) => {
        res.status(200).json({
            Greeting: 'Hello my RestApi'
        });
    });

    RouterApi(app);
    app.use(handlerConsoleError);
    app.use(handlerOrmError);
    app.use(handlerErrorServer);

    return app;
};

module.exports = { createApp };