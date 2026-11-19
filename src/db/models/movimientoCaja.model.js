const { Model, DataTypes } = require('sequelize');
const { CAJA_TABLE } = require('./caja.model');
const { USUARIO_TABLE } = require('./usuario.model');

const MOVIMIENTO_CAJA_TABLE = 'movimientos_caja';

const schemaMovimientoCaja = {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    cajaId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'caja_id',
        references: {
            model: CAJA_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    tipo: {
        allowNull: false,
        type: DataTypes.STRING(10),
        validate: {
            isIn: [['ingreso', 'egreso']],
        },
    },
    concepto: {
        allowNull: false,
        type: DataTypes.STRING(200),
    },
    monto: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        validate: {
            min: 0.01,
        },
    },
    fecha: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    usuarioId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'usuario_id',
        references: {
            model: USUARIO_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
};

class MovimientoCaja extends Model {
    static associate(models) {
        this.belongsTo(models.Caja, {
            as: 'caja',
            foreignKey: 'cajaId',
        });
        this.belongsTo(models.Usuario, {
            as: 'usuario',
            foreignKey: 'usuarioId',
        });
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: MOVIMIENTO_CAJA_TABLE,
            modelName: 'MovimientoCaja',
            timestamps: false,
        };
    }
}

module.exports = { MovimientoCaja, MOVIMIENTO_CAJA_TABLE, schemaMovimientoCaja };