const { Model, DataTypes } = require('sequelize');

const PROVEEDOR_TABLE = 'proveedores';

const schemaProveedor = {
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
  telefono: {
    allowNull: true,
    type: DataTypes.STRING(20),
  },
  email: {
    allowNull: true,
    type: DataTypes.STRING(120),
  },
  direccion: {
    allowNull: true,
    type: DataTypes.STRING(200),
  },
  diasCredito: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'dias_credito',
    defaultValue: 0,
  },
  activo: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
};

class Proveedor extends Model {
  static associate(models) {
    this.hasMany(models.Compra, {
      as: 'compras',
      foreignKey: 'proveedorId',
    });
    this.hasMany(models.CuentaPorPagar, {
      as: 'cuentasPorPagar',
      foreignKey: 'proveedorId',
    });
    this.belongsToMany(models.Insumo, {
      as: 'insumos',
      through: models.InsumoProveedor,
      foreignKey: 'proveedorId',
      otherKey: 'insumoId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PROVEEDOR_TABLE,
      modelName: 'Proveedor',
      timestamps: false,
    };
  }
}

module.exports = { Proveedor, PROVEEDOR_TABLE, schemaProveedor };