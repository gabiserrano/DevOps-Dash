const { config } = require("../config/config.env")
const { Sequelize } = require("sequelize")

let options = {
    dbUrl: config.dbUrl
}

if (config.env === 'e2e') {
    options.dbUrl = config.dbUrle2e
}

const sequelize = new Sequelize(options.dbUrl, {
    dialect: 'postgres',
    logging: config.env === 'dev' ? console.log : false
})

module.exports = sequelize