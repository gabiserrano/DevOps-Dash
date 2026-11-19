const { Model, DataTypes } = require('sequelize');
const { VENTA_TABLE } = require('./venta.model');
const { PRODUCTO_TABLE } = require('./producto.model');

const VENTA_DETALLE_TABLE = 'venta_detalle';

const schemaVentaDetalle = {
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
    productoId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'producto_id',
        references: {
            model: PRODUCTO_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    cantidad: {
        allowNull: false,
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
        },
    },
    precioUnitario: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2),
        field: 'precio_unitario',
    },
    subtotal: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
    },
};

class VentaDetalle extends Model {
    static associate(models) {
        this.belongsTo(models.Venta, {
            as: 'venta',
            foreignKey: 'ventaId',
        });
        this.belongsTo(models.Producto, {
            as: 'producto',
            foreignKey: 'productoId',
        });
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: VENTA_DETALLE_TABLE,
            modelName: 'VentaDetalle',
            timestamps: false,
        };
    }
}

module.exports = { VentaDetalle, VENTA_DETALLE_TABLE, schemaVentaDetalle };