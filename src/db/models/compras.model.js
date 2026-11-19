
module.exports = (sequelize, DataTypes) => {
  const Compra = sequelize.define('Compra', {
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
    proveedor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proveedores',
        key: 'id',
      },
    },
    numero_factura: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tipo_pago: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['contado', 'credito']],
      },
    },
    clasificacion: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'costo',
      validate: {
        isIn: [['costo', 'gasto']],
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    iva: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
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
    tableName: 'compras',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['proveedor_id', 'numero_factura'],
      },
    ],
  });

  return Compra;
};
