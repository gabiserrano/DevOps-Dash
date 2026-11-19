
module.exports = (sequelize, DataTypes) => {
  const MetodoPago = sequelize.define('MetodoPago', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    es_efectivo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'metodos_pago',
    timestamps: false,
  });

  return MetodoPago;
};
