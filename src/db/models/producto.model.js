const { Model, DataTypes } = require('sequelize');
const { INSUMO_TABLE } = require('./insumo.model');

const PRODUCTO_TABLE = 'productos';

const schemaProducto = {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        allowNull: false,
        type: DataTypes.STRING(120),
        unique: true,
    },
    categoria: {
        allowNull: true,
        type: DataTypes.STRING(50),
    },
    tipo: {
        allowNull: false,
        type: DataTypes.STRING(10),
        validate: {
            isIn: [['elaborado', 'reventa']],
        },
    },
    precio: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2),
    },
    insumoId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'insumo_id',
        references: {
            model: INSUMO_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    activo: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
};

class Producto extends Model {
    static associate(models) {
        this.belongsTo(models.Insumo, {
            as: 'insumo',
            foreignKey: 'insumoId',
        });
        this.hasMany(models.Receta, {
            as: 'receta',
            foreignKey: 'productoId',
        });
        this.hasMany(models.VentaDetalle, {
            as: 'ventaDetalles',
            foreignKey: 'productoId',
        });
    }
    static config(sequelize) {
        return {
            sequelize,
            tableName: PRODUCTO_TABLE,
            modelName: 'Producto',
            timestamps: false,
            validate: {
                reventaRequiredInsumo() {
                    if (this.tipo === 'reventa' && (this.insumoId === null || this.insumoId === undefined)) {
                        throw new Error('El producto de reventa requiere el id de insumo');
                    }
                },
            },
        };
    }
}

module.exports = { Producto, PRODUCTO_TABLE, schemaProducto };