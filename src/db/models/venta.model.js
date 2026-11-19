const { Model, DataTypes } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursal.model');
const { CAJA_TABLE } = require('./caja.model');
const { USUARIO_TABLE } = require('./usuario.model');
const { CLIENTE_TABLE } = require('./cliente.model');

const VENTA_TABLE = 'ventas';

const schemaVenta = {
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
  cajaId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'caja_id',
    references: {
      model: CAJA_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  usuarioId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'usuario_id',
    references: {
      model: USUARIO_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  clienteId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'cliente_id',
    references: {
      model: CLIENTE_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  tipoDoc: {
    allowNull: false,
    type: DataTypes.STRING(5),
    field: 'tipo_doc',
    validate: {
      isIn: [['FCF', 'CCF']],
    },
  },
  serie: {
    allowNull: false,
    type: DataTypes.STRING(10),
    defaultValue: 'A',
  },
  numeroDoc: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'numero_doc',
  },
  fecha: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  subtotal: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
  },
  iva: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
  },
  total: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
  },
  estado: {
    allowNull: false,
    type: DataTypes.STRING(10),
    defaultValue: 'emitida',
    validate: {
      isIn: [['emitida', 'anulada']],
    },
  },
};

class Venta extends Model {
  static associate(models) {
    this.belongsTo(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'sucursalId',
    });
    this.belongsTo(models.Caja, {
      as: 'caja',
      foreignKey: 'cajaId',
    });
    this.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'usuarioId',
    });
    this.belongsTo(models.Cliente, {
      as: 'cliente',
      foreignKey: 'clienteId',
    });
    this.hasMany(models.VentaDetalle, {
      as: 'detalles',
      foreignKey: 'ventaId',
    });
    this.hasMany(models.VentaPago, {
      as: 'pagos',
      foreignKey: 'ventaId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: VENTA_TABLE,
      modelName: 'Venta',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['sucursal_id', 'tipo_doc', 'serie', 'numero_doc'],
        },
      ],
      validate: {
        clienteObligatorioParaCCF() {
          if (this.tipoDoc === 'CCF' && this.clienteId == null) {
            throw new Error('El cliente es obligatorio para CCF');
          }
        },
      },
    };
  }
}

module.exports = { Venta, VENTA_TABLE, schemaVenta };