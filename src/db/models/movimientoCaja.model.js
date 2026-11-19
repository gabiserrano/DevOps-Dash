const { DataTypes } = require('sequelize');
const sequelize = require('../config.db');

const MovimientoCaja = sequelize.define('MovimientoCaja', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    caja_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cajas',
            key: 'id'
        }
    },

    tipo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: [['ingreso', 'egreso']]
        }
    },

    concepto: {
        type: DataTypes.STRING(200),
        allowNull: false
    },

    monto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },

    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }

}, {
    tableName: 'movimientos_caja',
    timestamps: false
});

module.exports = MovimientoCaja;
