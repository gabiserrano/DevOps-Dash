const { DataTypes, Sequelize } = require('sequelize');
const Sequelize = require('../config.db');
const { allow } = require('joi');

const Rol = sequelize.define('Rol', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nombre: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    }
},
    {
        tableName: 'roles',
        timestamps: false
    });

module.exports = Rol;