const { Model, DataTypes } = require('sequelize');
const { EMPLEADO_TABLE } = require('./empleado.model');
const { SUCURSAL_TABLE } = require('./sucursal.model');
const { ROL_TABLE } = require('./rol.model');

const USUARIO_TABLE = 'usuarios';

const schemaUsuario = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  empleadoId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'empleado_id',
    references: {
      model: EMPLEADO_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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
  rolId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'rol_id',
    references: {
      model: ROL_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  email: {
    allowNull: false,
    type: DataTypes.STRING(120),
    unique: true,
  },
  passwordHash: {
    allowNull: false,
    type: DataTypes.STRING(255),
    field: 'password_hash',
  },
  activo: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  creadoEn: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'creado_en',
    defaultValue: DataTypes.NOW,
  },
};

class Usuario extends Model {
  static associate(models) {
    this.belongsTo(models.Empleado, {
      as: 'empleado',
      foreignKey: 'empleadoId',
    });
    this.belongsTo(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'sucursalId',
    });
    this.belongsTo(models.Rol, {
      as: 'rol',
      foreignKey: 'rolId',
    });
    this.hasMany(models.Caja, {
      as: 'cajas',
      foreignKey: 'usuarioId',
    });
    this.hasMany(models.MovimientoCaja, {
      as: 'movimientosCaja',
      foreignKey: 'usuarioId',
    });
    this.hasMany(models.Compra, {
      as: 'compras',
      foreignKey: 'usuarioId',
    });
    this.hasMany(models.MovimientoInventario, {
      as: 'movimientosInventario',
      foreignKey: 'usuarioId',
    });
    this.hasMany(models.PagoCxp, {
      as: 'pagosCxp',
      foreignKey: 'usuarioId',
    });
    this.hasMany(models.Planilla, {
      as: 'planillasCreadas',
      foreignKey: 'creadaPor',
    });
    this.hasMany(models.Venta, {
      as: 'ventas',
      foreignKey: 'usuarioId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: USUARIO_TABLE,
      modelName: 'Usuario',
      timestamps: false,
    };
  }
}

module.exports = { Usuario, USUARIO_TABLE, schemaUsuario };