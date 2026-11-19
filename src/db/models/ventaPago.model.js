const { Model, DataTypes } = require('sequelize');
const { VENTA_TABLE } = require('./venta.model');
const { METODO_PAGO_TABLE } = require('./metodoPago.model');

const VENTA_PAGO_TABLE = 'venta_pagos';

const schemaVentaPago = {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ventaId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'venta_id',
        references: {
            model: VENTA_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    metodoPagoId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'metodo_pago_id',
        references: {
            model: METODO_PAGO_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    monto: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        validate: {
            min: 0.01,
        },
    },
    referencia: {
        allowNull: true,
        type: DataTypes.STRING(80),
    },
};

class VentaPago extends Model {
    static associate(models) {
        this.belongsTo(models.Venta, {
            as: 'venta',
            foreignKey: 'ventaId',
        });
        this.belongsTo(models.MetodoPago, {
            as: 'metodoPago',
            foreignKey: 'metodoPagoId',
        });
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: VENTA_PAGO_TABLE,
            modelName: 'VentaPago',
            timestamps: false,
        };
    }
}

module.exports = { VentaPago, VENTA_PAGO_TABLE, schemaVentaPago };