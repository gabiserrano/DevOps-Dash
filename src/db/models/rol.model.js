const { Model, DataTypes } = require('sequelize');

const ROL_TABLE = 'roles';

const schemaRol = {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        allowNull: false,
        type: DataTypes.STRING(30),
        unique: true,
    },
};

class Rol extends Model {
    static associate(models) {
        this.hasMany(models.Usuario, {
            as: 'usuarios',
            foreignKey: 'rolId',
        });
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: ROL_TABLE,
            modelName: 'Rol',
            timestamps: false,
        };
    }
}

module.exports = { Rol, ROL_TABLE, schemaRol };