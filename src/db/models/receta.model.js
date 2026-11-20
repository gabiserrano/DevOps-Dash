const { Model, DataTypes } = require('sequelize');
const { PRODUCTO_TABLE } = require('./producto.model');
const { INSUMO_TABLE } = require('./insumo.model');

const RECETA_TABLE = 'recetas';

const schemaReceta = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productoId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'producto_id',
    references: {
      model: PRODUCTO_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
  cantidad: {
    allowNull: false,
    type: DataTypes.DECIMAL(12, 3),
    validate: {
      min: 0.001,
    },
  },
};

class Receta extends Model {
  static associate(models) {
    this.belongsTo(models.Producto, {
      as: 'producto',
      foreignKey: 'productoId',
    });
    this.belongsTo(models.Insumo, {
      as: 'insumo',
      foreignKey: 'insumoId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: RECETA_TABLE,
      modelName: 'Receta',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['producto_id', 'insumo_id'],
        },
      ],
    };
  }
}

module.exports = { Receta, RECETA_TABLE, schemaReceta };