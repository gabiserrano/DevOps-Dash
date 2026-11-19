
module.exports = (sequelize, DataTypes) => {
  const CompraDetalle = sequelize.define('CompraDetalle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    compra_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'compras',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    insumo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'insumos',
        key: 'id',
      },
    },
    cantidad: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      validate: {
        min: 0.001,
      },
    },
    costo_unitario: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  }, {
    tableName: 'compra_detalle',
    timestamps: false,
  });

  return CompraDetalle;
};
