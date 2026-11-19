
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/config.db');

const Inventario = sequelize.define('Inventario', {
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

  insumo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'insumos',
      key: 'id'
    }
  },

  stock_actual: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false,
    defaultValue: 0
  },

  stock_minimo: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'inventario',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['sucursal_id', 'insumo_id']
    }
  ]
});

module.exports = Inventario;
