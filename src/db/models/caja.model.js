const { DataTypes } = require('sequelize');
const sequelize = require('../config.db');

const caja = sequelize.define('caja', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    sucursal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sucursales',
            key: 'id'
        }
    },

    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },

    turno: {
        type: DataTypes.STRING(15),
        allowNull: false,
        validate: {
            isIn: [['Manana', 'Tarde', 'Noche']]
        }
    },

    fecha_apertura: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    monto_inicial: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 }
    },

    estado: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'abierta',
        validate: {
            isIn: [['abierta', 'cerrada']]
        }
    },

    fecha_cierre: {
        type: DataTypes.DATE,
        allowNull: true
    },

    efectivo_esperado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },

    efectivo_real: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },

    diferencia: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },

    tarjeta_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },

    observaciones: {
        type: DataTypes.STRING(300),
        allowNull: true
    }
}, {
    tableName: 'cajas',
    timestamps: false
});

module.exports = Caja;