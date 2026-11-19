
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/config.db');

const Receta = sequelize.define('Receta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  insumo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  cantidad: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false,
    validate: {
      min: 0.001
    }
  }
}, {
  tableName: 'recetas',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['producto_id', 'insumo_id']
    }
  ]
});

module.exports = Receta;
