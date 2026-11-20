const express = require('express');
const passport = require('passport');
const { validationSchema } = require('../middlewares/validation.schema');
const { loginSchema } = require('../schemas/auth.schema');
const {
    loginController,
    getProfileController,
} = require('../controllers/auth.controller');

const authRouter = express.Router();

authRouter.post(
    '/login',
    validationSchema(loginSchema, 'body'),
    passport.authenticate('local', { session: false }),
    loginController
);

authRouter.get(
    '/me',
    passport.authenticate('jwt', { session: false }),
    getProfileController
);

module.exports = { authRouter };