
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/config.db');

const Insumo = sequelize.define('Insumo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  nombre: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true
  },

  unidad: {
    type: DataTypes.STRING(10),
    allowNull: false
  },

  costo_promedio: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0
  },

  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'insumos',
  timestamps: false
});

module.exports = Insumo;
