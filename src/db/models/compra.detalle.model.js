const { Model, DataTypes } = require('sequelize');
const { COMPRA_TABLE } = require('./compra.model');
const { INSUMO_TABLE } = require('./insumo.model');

const COMPRA_DETALLE_TABLE = 'compra_detalle';

const schemaCompraDetalle = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  compraId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'compra_id',
    references: {
      model: COMPRA_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  insumoId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'insumo_id',
    references: {
      model: INSUMO_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  cantidad: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 3),
    validate: {
      min: 0.001,
    },
  },
  costoUnitario: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 4),
    field: 'costo_unitario',
    validate: {
      min: 0,
    },
  },
  subtotal: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
  },
};

class CompraDetalle extends Model {
  static associate(models) {
    this.belongsTo(models.Compra, {
      as: 'compra',
      foreignKey: 'compraId',
    });
    this.belongsTo(models.Insumo, {
      as: 'insumo',
      foreignKey: 'insumoId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COMPRA_DETALLE_TABLE,
      modelName: 'CompraDetalle',
      timestamps: false,
    };
  }
}

module.exports = { CompraDetalle, COMPRA_DETALLE_TABLE, schemaCompraDetalle };