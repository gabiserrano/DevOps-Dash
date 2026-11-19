const { DataTypes } = require('sequelize');
const sequelize = require('../config.db');

const Planilla = sequelize.define('Planilla', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    sucursal_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'sucursales',
            key: 'id'
        }
    },

    fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    estado: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'borrador',
        validate: {
            isIn: [['borrador', 'aprobada', 'pagada']]
        }
    },

    creada_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }

}, {
    tableName: 'planillas',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['sucursal_id', 'fecha_inicio', 'fecha_fin']
        }
    ]
});

module.exports = Planilla;
