const { Model, DataTypes } = require('sequelize');
const { CUENTA_POR_PAGAR_TABLE } = require('./cuentaPorPagar.model');
const { METODO_PAGO_TABLE } = require('./metodoPago.model');
const { USUARIO_TABLE } = require('./usuario.model');

const PAGO_CXP_TABLE = 'pagos_cxp';

const schemaPagoCxp = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cxpId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'cxp_id',
    references: {
      model: CUENTA_POR_PAGAR_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  monto: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
    validate: {
      min: 0.01,
    },
  },
  metodoPagoId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'metodo_pago_id',
    references: {
      model: METODO_PAGO_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  fecha: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  usuarioId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'usuario_id',
    references: {
      model: USUARIO_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
};

class PagoCxp extends Model {
  static associate(models) {
    this.belongsTo(models.CuentaPorPagar, {
      as: 'cuentaPorPagar',
      foreignKey: 'cxpId',
    });
    this.belongsTo(models.MetodoPago, {
      as: 'metodoPago',
      foreignKey: 'metodoPagoId',
    });
    this.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'usuarioId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PAGO_CXP_TABLE,
      modelName: 'PagoCxp',
      timestamps: false,
    };
  }
}

module.exports = { PagoCxp, PAGO_CXP_TABLE, schemaPagoCxp };