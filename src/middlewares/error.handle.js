const { ValidationError } = require('sequelize');

function handlerConsoleError(err, _req, _res, next) {
    console.error(err);
    next(err);
}

function handlerOrmError(err, _req, res, next) {
    if (err instanceof ValidationError) {
        return res.status(409).json({
            statusCode: 409,
            message: err.name,
            errors: err.errors
        });
    }

    return next(err);
}

function handlerErrorServer(err, _req, res, _next) {
    res.status(500).json({
        err: err.stack,
        message: err.message
    });
}

module.exports = {
    handlerConsoleError,
    handlerOrmError,
    handlerErrorServer
};