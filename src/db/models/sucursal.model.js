const { Model, DataTypes } = require('sequelize');

const SUCURSAL_TABLE = 'sucursales';

const schemaSucursal = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING(100),
  },
  direccion: {
    allowNull: true,
    type: DataTypes.STRING(200),
  },
  telefono: {
    allowNull: true,
    type: DataTypes.STRING(20),
  },
  activa: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
};

class Sucursal extends Model {
  static associate(models) {
    this.hasMany(models.Usuario, {
      as: 'usuarios',
      foreignKey: 'sucursalId',
    });
    this.hasMany(models.Empleado, {
      as: 'empleados',
      foreignKey: 'sucursalId',
    });
    this.hasMany(models.Caja, {
      as: 'cajas',
      foreignKey: 'sucursalId',
    });
    this.hasMany(models.Compra, {
      as: 'compras',
      foreignKey: 'sucursalId',
    });
    this.hasMany(models.Correlativo, {
      as: 'correlativos',
      foreignKey: 'sucursalId',
    });
    this.hasMany(models.Inventario, {
      as: 'inventarios',
      foreignKey: 'sucursalId',
    });
    this.hasMany(models.MovimientoInventario, {
      as: 'movimientosInventario',
      foreignKey: 'sucursalId',
    });
    this.hasMany(models.Planilla, {
      as: 'planillas',
      foreignKey: 'sucursalId',
    });
    this.hasMany(models.Venta, {
      as: 'ventas',
      foreignKey: 'sucursalId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: SUCURSAL_TABLE,
      modelName: 'Sucursal',
      timestamps: false,
    };
  }
}

module.exports = { Sucursal, SUCURSAL_TABLE, schemaSucursal };