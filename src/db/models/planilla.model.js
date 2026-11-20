const { Model, DataTypes } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursal.model');
const { USUARIO_TABLE } = require('./usuario.model');

const PLANILLA_TABLE = 'planillas';

const schemaPlanilla = {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sucursalId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'sucursal_id',
        references: {
            model: SUCURSAL_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    fechaInicio: {
        allowNull: false,
        type: DataTypes.DATEONLY,
        field: 'fecha_inicio',
    },
    fechaFin: {
        allowNull: false,
        type: DataTypes.DATEONLY,
        field: 'fecha_fin',
    },
    estado: {
        allowNull: false,
        type: DataTypes.STRING(10),
        defaultValue: 'borrador',
        validate: {
            isIn: [['borrador', 'aprobada', 'pagada']],
        },
    },
    creadaPor: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'creada_por',
        references: {
            model: USUARIO_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
};

class Planilla extends Model {
    static associate(models) {
        this.belongsTo(models.Sucursal, {
            as: 'sucursal',
            foreignKey: 'sucursalId',
        });
        this.belongsTo(models.Usuario, {
            as: 'creador',
            foreignKey: 'creadaPor',
        });
        this.hasMany(models.PlanillaDetalle, {
            as: 'detalles',
            foreignKey: 'planillaId',
        });
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: PLANILLA_TABLE,
            modelName: 'Planilla',
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['sucursal_id', 'fecha_inicio', 'fecha_fin'],
                },
            ],
        };
    }
}

module.exports = { Planilla, PLANILLA_TABLE, schemaPlanilla };