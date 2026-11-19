
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/config.db');

const MovimientoInventario = sequelize.define('MovimientoInventario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  sucursal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sucursales',
      key: 'id'
    }
  },

  insumo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'insumos',
      key: 'id'
    }
  },

  tipo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['entrada', 'salida', 'ajuste']]
    }
  },

  cantidad: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false
  },

  motivo: {
    type: DataTypes.STRING(30),
    allowNull: false
  },

  referencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },

  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'movimientos_inventario',
  timestamps: false
});

module.exports = MovimientoInventario;
