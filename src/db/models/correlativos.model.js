
module.exports = (sequelize, DataTypes) => {
  const Correlativo = sequelize.define('Correlativo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sucursal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sucursales',
        key: 'id',
      },
    },
    tipo_doc: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        isIn: [['FCF', 'CCF']],
      },
    },
    serie: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'A',
    },
    ultimo_numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'correlativos',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['sucursal_id', 'tipo_doc', 'serie'],
      },
    ],
  });

  return Correlativo;
};
