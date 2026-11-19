
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/config.db');

const Proveedor = sequelize.define('Proveedor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },

  nit: {
    type: DataTypes.STRING(17),
    allowNull: true
  },

  nrc: {
    type: DataTypes.STRING(15),
    allowNull: true
  },

  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  email: {
    type: DataTypes.STRING(120),
    allowNull: true
  },

  direccion: {
    type: DataTypes.STRING(200),
    allowNull: true
  },

  dias_credito: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }

}, {
  tableName: 'proveedores',
  timestamps: false
});

module.exports = Proveedor;
