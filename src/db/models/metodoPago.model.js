const { Model, DataTypes } = require('sequelize');

const METODO_PAGO_TABLE = 'metodos_pago';

const schemaMetodoPago = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING(30),
    unique: true,
  },
  esEfectivo: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    field: 'es_efectivo',
    defaultValue: false,
  },
};

class MetodoPago extends Model {
  static associate(models) {
    this.hasMany(models.PagoCxp, {
      as: 'pagosCxp',
      foreignKey: 'metodoPagoId',
    });
    this.hasMany(models.VentaPago, {
      as: 'ventaPagos',
      foreignKey: 'metodoPagoId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: METODO_PAGO_TABLE,
      modelName: 'MetodoPago',
      timestamps: false,
    };
  }
}

module.exports = { MetodoPago, METODO_PAGO_TABLE, schemaMetodoPago };