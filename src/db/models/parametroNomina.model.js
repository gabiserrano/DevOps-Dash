const { Model, DataTypes } = require('sequelize');

const PARAMETRO_NOMINA_TABLE = 'parametros_nomina';

const schemaParametroNomina = {
    clave: {
        allowNull: false,
        type: DataTypes.STRING(30),
        primaryKey: true,
    },
    valor: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 4),
    },
};

class ParametroNomina extends Model {
    static associate(models) {
        // Tabla de parámetros de configuración de nómina (sin relaciones por FK)
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: PARAMETRO_NOMINA_TABLE,
            modelName: 'ParametroNomina',
            timestamps: false,
        };
    }
}

module.exports = { ParametroNomina, PARAMETRO_NOMINA_TABLE, schemaParametroNomina };