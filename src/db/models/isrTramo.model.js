const { Model, DataTypes } = require('sequelize');

const ISR_TRAMO_TABLE = 'isr_tramos';

const schemaIsrTramo = {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    periodo: {
        allowNull: false,
        type: DataTypes.STRING(10),
        defaultValue: 'quincenal',
    },
    desde: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
    },
    hasta: {
        allowNull: true,
        type: DataTypes.DECIMAL(12, 2),
    },
    porcentaje: {
        allowNull: false,
        type: DataTypes.DECIMAL(5, 2),
    },
    sobreExceso: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        field: 'sobre_exceso',
        defaultValue: 0,
    },
    cuotaFija: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 2),
        field: 'cuota_fija',
        defaultValue: 0,
    },
};

class IsrTramo extends Model {
    static associate(models) {
        // Tabla de configuración/catálogo de tramos ISR (sin relaciones directas por FK)
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: ISR_TRAMO_TABLE,
            modelName: 'IsrTramo',
            timestamps: false,
        };
    }
}

module.exports = { IsrTramo, ISR_TRAMO_TABLE, schemaIsrTramo };
