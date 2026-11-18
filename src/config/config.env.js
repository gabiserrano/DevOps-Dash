require('dotenv').config

const { validationEnv } = require("./validation.env");

const config = {
    env: process.env.ENV || 'dev',
    port: parseInt(process.env.PORT || '3000'),
    dbUrl: process.env.DB_URL,
    dbUrle2e: process.env.DB_URL_E2E,
    jwtSecret: process.env.JWT_SECRET || ''
}

validationEnv(config)

module.exports = { config }