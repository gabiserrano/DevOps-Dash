const { Model, DataTypes } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursal.model');

const CORRELATIVO_TABLE = 'correlativos';

const schemaCorrelativo = {
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
  ultimoNumero: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'ultimo_numero',
    defaultValue: 0,
  },
};

class Correlativo extends Model {
  static associate(models) {
    this.belongsTo(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'sucursalId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CORRELATIVO_TABLE,
      modelName: 'Correlativo',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['sucursal_id', 'tipo_doc', 'serie'],
        },
      ],
    };
  }
}

module.exports = { Correlativo, CORRELATIVO_TABLE, schemaCorrelativo };