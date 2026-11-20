const jwt = require('jsonwebtoken');
const { config } = require('../config/config.env');
const { HttpError } = require('./httpError.helper');

function signToken(payload, options = { expiresIn: '8h' }) {
    return jwt.sign(payload, config.jwtSecret, options);
}

function verifyToken(token) {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        throw new HttpError(401, 'Token inválido o expirado');
    }
}

function decodeToken(token) {
    return jwt.decode(token);
}

module.exports = {
    signToken,
    verifyToken,
    decodeToken,
};