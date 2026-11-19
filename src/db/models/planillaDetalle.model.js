const { Model, DataTypes } = require('sequelize');
const { PLANILLA_TABLE } = require('./planilla.model');
const { EMPLEADO_TABLE } = require('./empleado.model');

const PLANILLA_DETALLE_TABLE = 'planilla_detalle';

const schemaPlanillaDetalle = {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    planillaId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'planilla_id',
        references: {
            model: PLANILLA_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    empleadoId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'empleado_id',
        references: {
            model: EMPLEADO_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    salarioBruto: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        field: 'salario_bruto',
    },
    isss: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    afp: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    isr: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    otrasDeducciones: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        field: 'otras_deducciones',
        defaultValue: 0,
    },
    salarioNeto: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        field: 'salario_neto',
    },
};

class PlanillaDetalle extends Model {
    static associate(models) {
        this.belongsTo(models.Planilla, {
            as: 'planilla',
            foreignKey: 'planillaId',
        });
        this.belongsTo(models.Empleado, {
            as: 'empleado',
            foreignKey: 'empleadoId',
        });
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: PLANILLA_DETALLE_TABLE,
            modelName: 'PlanillaDetalle',
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['planilla_id', 'empleado_id'],
                },
            ],
        };
    }
}

module.exports = { PlanillaDetalle, PLANILLA_DETALLE_TABLE, schemaPlanillaDetalle };
