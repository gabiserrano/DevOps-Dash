
module.exports = (sequelize, DataTypes) => {
  const Empleado = sequelize.define('Empleado', {
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
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dui: {
      type: DataTypes.STRING(10),
      allowNull: true,
      unique: true,
    },
    nit: {
      type: DataTypes.STRING(17),
      allowNull: true,
    },
    puesto: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [['barista', 'cajero', 'gerente']],
      },
    },
    salario_mensual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    fecha_contratacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'empleados',
    timestamps: false,
  });

  return Empleado;
};
