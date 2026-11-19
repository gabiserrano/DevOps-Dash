const { DataTypes } = require('sequelize');
const sequelize = require('../config.db');

const IsrTramo = sequelize.define('IsrTramo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    periodo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'quincenal'
    },

    desde: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },

    hasta: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },

    porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },

    sobre_exceso: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    cuota_fija: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    }

}, {
    tableName: 'isr_tramos',
    timestamps: false
});

module.exports = IsrTramo;
