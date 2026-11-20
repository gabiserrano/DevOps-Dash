const { Model, DataTypes } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursal.model');
const { USUARIO_TABLE } = require('./usuario.model');

const CAJA_TABLE = 'cajas';

const schemaCaja = {
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
    usuarioId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'usuario_id',
        references: {
            model: USUARIO_TABLE,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    turno: {
        allowNull: false,
        type: DataTypes.STRING(15),
        validate: {
            isIn: [['manana', 'tarde', 'noche']],
        },
    },
    fechaApertura: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'fecha_apertura',
        defaultValue: DataTypes.NOW,
    },
    montoInicial: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        field: 'monto_inicial',
        validate: {
            min: 0,
        },
    },
    estado: {
        allowNull: false,
        type: DataTypes.STRING(10),
        defaultValue: 'abierta',
        validate: {
            isIn: [['abierta', 'cerrada']],
        },
    },
    fechaCierre: {
        allowNull: true,
        type: DataTypes.DATE,
        field: 'fecha_cierre',
    },
    efectivoEsperado: {
        allowNull: true,
        type: DataTypes.DECIMAL(12, 2),
        field: 'efectivo_esperado',
    },
    efectivoReal: {
        allowNull: true,
        type: DataTypes.DECIMAL(12, 2),
        field: 'efectivo_real',
    },
    diferencia: {
        allowNull: true,
        type: DataTypes.DECIMAL(12, 2),
    },
    tarjetaTotal: {
        allowNull: true,
        type: DataTypes.DECIMAL(12, 2),
        field: 'tarjeta_total',
    },
    digitalTotal: {
        allowNull: true,
        type: DataTypes.DECIMAL(12, 2),
        field: 'digital_total',
    },
    observaciones: {
        allowNull: true,
        type: DataTypes.STRING(300),
    },
};

class Caja extends Model {
    static associate(models) {
        this.belongsTo(models.Sucursal, {
            as: 'sucursal',
            foreignKey: 'sucursalId',
        });
        this.belongsTo(models.Usuario, {
            as: 'usuario',
            foreignKey: 'usuarioId',
        });
        this.hasMany(models.MovimientoCaja, {
            as: 'movimientos',
            foreignKey: 'cajaId',
        });
        this.hasMany(models.Venta, {
            as: 'ventas',
            foreignKey: 'cajaId',
        });
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: CAJA_TABLE,
            modelName: 'Caja',
            timestamps: false,
        };
    }
}

module.exports = { Caja, CAJA_TABLE, schemaCaja };