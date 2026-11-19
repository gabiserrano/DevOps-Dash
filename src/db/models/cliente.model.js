const { Model, DataTypes } = require('sequelize');

const CLIENTE_TABLE = 'clientes';

const schemaCliente = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING(150),
  },
  nit: {
    allowNull: true,
    type: DataTypes.STRING(17),
  },
  nrc: {
    allowNull: true,
    type: DataTypes.STRING(15),
  },
  giro: {
    allowNull: true,
    type: DataTypes.STRING(150),
  },
  direccion: {
    allowNull: true,
    type: DataTypes.STRING(200),
  },
  email: {
    allowNull: true,
    type: DataTypes.STRING(120),
  },
};

class Cliente extends Model {
  static associate(models) {
    this.hasMany(models.Venta, {
      as: 'ventas',
      foreignKey: 'clienteId',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: CLIENTE_TABLE,
      modelName: 'Cliente',
      timestamps: false,
    };
  }
}

module.exports = { Cliente, CLIENTE_TABLE, schemaCliente };