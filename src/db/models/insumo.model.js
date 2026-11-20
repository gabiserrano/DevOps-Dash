const { Model, DataTypes } = require('sequelize');

const INSUMO_TABLE = 'insumos';

const schemaInsumo = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING(120),
    unique: true,
  },
  sku: {
    allowNull: true,
    type: DataTypes.STRING(30),
    unique: true,
  },
  categoria: {
    allowNull: true,
    type: DataTypes.STRING(50),
  },
  unidad: {
    allowNull: false,
    type: DataTypes.STRING(10),
  },
  costoPromedio: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 4),
    field: 'costo_promedio',
    defaultValue: 0,
  },
  activo: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
};

class Insumo extends Model {
  static associate(models) {
    this.hasMany(models.CompraDetalle, {
      as: 'compraDetalles',
      foreignKey: 'insumoId',
    });
    this.hasMany(models.Inventario, {
      as: 'inventarios',
      foreignKey: 'insumoId',
    });
    this.hasMany(models.MovimientoInventario, {
      as: 'movimientosInventario',
      foreignKey: 'insumoId',
    });
    this.hasMany(models.Producto, {
      as: 'productos',
      foreignKey: 'insumoId',
    });
    this.hasMany(models.Receta, {
      as: 'recetas',
      foreignKey: 'insumoId',
    });
    this.belongsToMany(models.Proveedor, {
      as: 'proveedores',
      through: models.InsumoProveedor,
      foreignKey: 'insumoId',
      otherKey: 'proveedorId',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: INSUMO_TABLE,
      modelName: 'Insumo',
      timestamps: false,
    };
  }
}

module.exports = { Insumo, INSUMO_TABLE, schemaInsumo };