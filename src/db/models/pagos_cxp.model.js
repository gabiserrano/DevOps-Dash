
module.exports = (sequelize, DataTypes) => {
  const PagoCxp = sequelize.define('PagoCxp', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cxp_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuentas_por_pagar',
        key: 'id',
      },
    },
    monto: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    metodo_pago_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'metodos_pago',
        key: 'id',
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
  }, {
    tableName: 'pagos_cxp',
    timestamps: false,
  });

  return PagoCxp;
};
