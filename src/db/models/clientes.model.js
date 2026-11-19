
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/config.db');

const Cliente = sequelize.define('Cliente', {
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

  giro: {
    type: DataTypes.STRING(150),
    allowNull: true
  },

  direccion: {
    type: DataTypes.STRING(200),
    allowNull: true
  },

  email: {
    type: DataTypes.STRING(120),
    allowNull: true
  }
}, {
  tableName: 'clientes',
  timestamps: false
});

module.exports = Cliente;
