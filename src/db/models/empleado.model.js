const { Model, DataTypes } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursal.model');

const EMPLEADO_TABLE = 'empleados';

const schemaEmpleado = {
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
  nombres: {
    allowNull: false,
    type: DataTypes.STRING(100),
  },
  apellidos: {
    allowNull: false,
    type: DataTypes.STRING(100),
  },
  dui: {
    allowNull: true,
    type: DataTypes.STRING(10),
    unique: true,
  },
  nit: {
    allowNull: true,
    type: DataTypes.STRING(17),
  },
  puesto: {
    allowNull: false,
    type: DataTypes.STRING(30),
    validate: {
      isIn: [['barista', 'cajero', 'gerente']],
    },
  },
  salarioMensual: {
    allowNull: false,
    type: DataTypes.DECIMAL(10, 2),
    field: 'salario_mensual',
    validate: {
      min: 0,
    },
  },
  fechaContratacion: {
    allowNull: false,
    type: DataTypes.DATEONLY,
    field: 'fecha_contratacion',
  },
  activo: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
};

class Empleado extends Model {
  static associate(models) {
    this.belongsTo(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'sucursalId',
    });
    this.hasOne(models.Usuario, {
      as: 'usuario',
      foreignKey: 'empleadoId',
    });
    this.hasMany(models.PlanillaDetalle, {
      as: 'planillas',
      foreignKey: 'empleadoId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: EMPLEADO_TABLE,
      modelName: 'Empleado',
      timestamps: false,
    };
  }
}

module.exports = { Empleado, EMPLEADO_TABLE, schemaEmpleado };