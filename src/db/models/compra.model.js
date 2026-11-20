const { Model, DataTypes } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursal.model');
const { PROVEEDOR_TABLE } = require('./proveedor.model');
const { USUARIO_TABLE } = require('./usuario.model');

const COMPRA_TABLE = 'compras';

const schemaCompra = {
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
  numeroFactura: {
    allowNull: false,
    type: DataTypes.STRING(40),
    field: 'numero_factura',
  },
  fecha: {
    allowNull: false,
    type: DataTypes.DATEONLY,
  },
  tipoPago: {
    allowNull: false,
    type: DataTypes.STRING(10),
    field: 'tipo_pago',
    validate: {
      isIn: [['contado', 'credito']],
    },
  },
  clasificacion: {
    allowNull: false,
    type: DataTypes.STRING(10),
    defaultValue: 'costo',
    validate: {
      isIn: [['costo', 'gasto']],
    },
  },
  subtotal: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
  },
  iva: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  total: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 2),
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

class Compra extends Model {
  static associate(models) {
    this.belongsTo(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'sucursalId',
    });
    this.belongsTo(models.Proveedor, {
      as: 'proveedor',
      foreignKey: 'proveedorId',
    });
    this.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'usuarioId',
    });
    this.hasMany(models.CompraDetalle, {
      as: 'detalles',
      foreignKey: 'compraId',
    });
    this.hasOne(models.CuentaPorPagar, {
      as: 'cuentaPorPagar',
      foreignKey: 'compraId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COMPRA_TABLE,
      modelName: 'Compra',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['proveedor_id', 'numero_factura'],
        },
      ],
    };
  }
}

module.exports = { Compra, COMPRA_TABLE, schemaCompra };