const { DataTypes } = require('sequelize');
const sequelize = require('../config.db');

const VentaPago = sequelize.define('VentaPago', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    venta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ventas',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },

    metodo_pago_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'metodos_pago',
            key: 'id'
        }
    },

    monto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },

    referencia: {
        type: DataTypes.STRING(80),
        allowNull: true
    }
}, {
    tableName: 'venta_pagos',
    timestamps: false
});

module.exports = VentaPago;
