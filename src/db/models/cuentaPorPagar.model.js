const { Model, DataTypes } = require('sequelize');
const { COMPRA_TABLE } = require('./compra.model');
const { PROVEEDOR_TABLE } = require('./proveedor.model');

const CUENTA_POR_PAGAR_TABLE = 'cuentas_por_pagar';

const schemaCuentaPorPagar = {
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
    unique: true,
    references: {
      model: COMPRA_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  proveedorId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'proveedor_id',
    references: {
      model: PROVEEDOR_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  montoTotal: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
    field: 'monto_total',
  },
  saldo: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
  },
  fechaVencimiento: {
    allowNull: false,
    type: DataTypes.DATEONLY,
    field: 'fecha_vencimiento',
  },
  estado: {
    allowNull: false,
    type: DataTypes.STRING(10),
    defaultValue: 'pendiente',
    validate: {
      isIn: [['pendiente', 'parcial', 'pagada']],
    },
  },
};

class CuentaPorPagar extends Model {
  static associate(models) {
    this.belongsTo(models.Compra, {
      as: 'compra',
      foreignKey: 'compraId',
    });
    this.belongsTo(models.Proveedor, {
      as: 'proveedor',
      foreignKey: 'proveedorId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CUENTA_POR_PAGAR_TABLE,
      modelName: 'CuentaPorPagar',
      timestamps: false,
    };
  }
}

module.exports = { CuentaPorPagar, CUENTA_POR_PAGAR_TABLE, schemaCuentaPorPagar };