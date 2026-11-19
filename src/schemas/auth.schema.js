const joi = require('joi');

const email = joi.string().email().max(120);
const password = joi.string().min(6).max(100);

const loginSchema = joi.object({
    email: email.required(),
    password: password.required(),
});

module.exports = {
    loginSchema,
};