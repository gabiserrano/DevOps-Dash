const { Model, DataTypes } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursal.model');
const { INSUMO_TABLE } = require('./insumo.model');

const INVENTARIO_TABLE = 'inventario';

const schemaInventario = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sucursalId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'sucursal_id',
    references: {
      model: SUCURSAL_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
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
  stockActual: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 3),
    field: 'stock_actual',
    defaultValue: 0,
  },
  stockMinimo: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 3),
    field: 'stock_minimo',
    defaultValue: 0,
  },
  actualizadoEn: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'actualizado_en',
    defaultValue: DataTypes.NOW,
  },
};

class Inventario extends Model {
  static associate(models) {
    this.belongsTo(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'sucursalId',
    });
    this.belongsTo(models.Insumo, {
      as: 'insumo',
      foreignKey: 'insumoId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: INVENTARIO_TABLE,
      modelName: 'Inventario',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['sucursal_id', 'insumo_id'],
        },
      ],
    };
  }
}

module.exports = { Inventario, INVENTARIO_TABLE, schemaInventario };