
module.exports = (sequelize, DataTypes) => {
  const Venta = sequelize.define('Venta', {
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
    caja_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cajas',
        key: 'id',
      },
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientes',
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
    numero_doc: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    iva: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'emitida',
      validate: {
        isIn: [['emitida', 'anulada']],
      },
    },
  }, {
    tableName: 'ventas',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['sucursal_id', 'tipo_doc', 'serie', 'numero_doc'],
      },
    ],
    validate: {
      clienteObligatorioParaCCF() {
        if (this.tipo_doc === 'CCF' && this.cliente_id == null) {
          throw new Error('El cliente es obligatorio para CCF');
        }
      },
    },
  });

  return Venta;
};
