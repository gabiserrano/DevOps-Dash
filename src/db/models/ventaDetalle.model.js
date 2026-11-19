const { DataTypes } = require('sequelize');
const sequelize = require('../config.db');

const VentaDetalle = sequelize.define('VentaDetalle', {
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

    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'productos',
            key: 'id'
        }
    },

    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },

    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    }

}, {
    tableName: 'venta_detalle',
    timestamps: false
});

module.exports = VentaDetalle;
