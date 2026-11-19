const { DataTypes } = require('sequelize');
const sequelize = require('../config.db');

const PlanillaDetalle = sequelize.define('PlanillaDetalle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    planilla_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'planillas',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },

    empleado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'empleados',
            key: 'id'
        }
    },

    salario_bruto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },

    isss: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    afp: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    isr: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    otras_deducciones: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    salario_neto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    }

}, {
    tableName: 'planilla_detalle',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['planilla_id', 'empleado_id']
        }
    ]
});

module.exports = PlanillaDetalle;
