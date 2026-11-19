const { DataTypes } = require('sequelize');
const sequelize = require('../config.db');

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    categoria: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('elaborado', 'reventa'),
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    insumo_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
}, {
    tableName: 'productos',
    timestamps: false,

    validate: {
        reventaRequiredInsumo() {
            if (this.tipo === 'reventa' && this.insumo_id === null) {
                throw new Error('El producto de reventa requiere el id de insumo');
            }
        }
    }
});