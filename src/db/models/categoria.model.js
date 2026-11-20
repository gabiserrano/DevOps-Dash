const { Model, DataTypes } = require('sequelize');

const CATEGORIA_TABLE = 'categorias';

const schemaCategoria = {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        allowNull: false,
        type: DataTypes.STRING(50),
        unique: true,
    },
};

class Categoria extends Model {
    static associate() {
        // Los productos guardan la categoría por nombre (productos.categoria).
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: CATEGORIA_TABLE,
            modelName: 'Categoria',
            timestamps: false,
        };
    }
}

module.exports = { Categoria, CATEGORIA_TABLE, schemaCategoria };
