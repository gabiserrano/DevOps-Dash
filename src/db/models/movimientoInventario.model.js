const { Model, DataTypes } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursal.model');
const { INSUMO_TABLE } = require('./insumo.model');
const { USUARIO_TABLE } = require('./usuario.model');

const MOVIMIENTO_INVENTARIO_TABLE = 'movimientos_inventario';

const schemaMovimientoInventario = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sucursalId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'sucursal_id',
    references: {
      model: SUCURSAL_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  insumoId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'insumo_id',
    references: {
      model: INSUMO_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  tipo: {
    allowNull: false,
    type: DataTypes.STRING(10),
    validate: {
      isIn: [['entrada', 'salida', 'ajuste']],
    },
  },
  cantidad: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 3),
  },
  motivo: {
    allowNull: false,
    type: DataTypes.STRING(30),
  },
  referenciaId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'referencia_id',
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
  fecha: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
};

class MovimientoInventario extends Model {
  static associate(models) {
    this.belongsTo(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'sucursalId',
    });
    this.belongsTo(models.Insumo, {
      as: 'insumo',
      foreignKey: 'insumoId',
    });
    this.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'usuarioId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MOVIMIENTO_INVENTARIO_TABLE,
      modelName: 'MovimientoInventario',
      timestamps: false,
    };
  }
}

module.exports = {
  MovimientoInventario,
  MOVIMIENTO_INVENTARIO_TABLE,
  schemaMovimientoInventario,
};