const { DataTypes } = require('sequelize');
const sequelize = require('../config.db');

const ParametroNomina = sequelize.define('ParametroNomina', {
    clave: {
        type: DataTypes.STRING(30),
        primaryKey: true,
        allowNull: false
    },

    valor: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: false
    }

}, {
    tableName: 'parametros_nomina',
    timestamps: false
});

module.exports = ParametroNomina;
