
module.exports = (sequelize, DataTypes) => {
  const CuentaPorPagar = sequelize.define('CuentaPorPagar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    compra_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'compras',
        key: 'id',
      },
    },
    proveedor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proveedores',
        key: 'id',
      },
    },
    monto_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    saldo: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'pendiente',
      validate: {
        isIn: [['pendiente', 'parcial', 'pagada']],
      },
    },
  }, {
    tableName: 'cuentas_por_pagar',
    timestamps: false,
  });

  return CuentaPorPagar;
};
