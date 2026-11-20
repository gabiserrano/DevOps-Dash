const { Model, DataTypes } = require('sequelize');
const { INSUMO_TABLE } = require('./insumo.model');
const { PROVEEDOR_TABLE } = require('./proveedor.model');

const INSUMO_PROVEEDOR_TABLE = 'insumo_proveedores';

const schemaInsumoProveedor = {
    insumoId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'insumo_id',
        references: { model: INSUMO_TABLE, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    proveedorId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'proveedor_id',
        references: { model: PROVEEDOR_TABLE, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
};

class InsumoProveedor extends Model {
    static associate() {
        // Tabla puente; las asociaciones viven en Insumo y Proveedor.
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: INSUMO_PROVEEDOR_TABLE,
            modelName: 'InsumoProveedor',
            timestamps: false,
        };
    }
}

module.exports = { InsumoProveedor, INSUMO_PROVEEDOR_TABLE, schemaInsumoProveedor };
