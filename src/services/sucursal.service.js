
const sequelize = require('../db/config.db');
const { models } = sequelize;

class SucursalService {
    async findAll() {
        return await models.Sucursal.findAll({
            order: [['id', 'ASC']],
        });
    }

    async findOne(id) {
        const sucursal = await models.Sucursal.findByPk(id);

        if (!sucursal) {
            const error = new Error('La sucursal no existe');
            error.statusCode = 404;
            throw error;
        }

        return sucursal;
    }

    async create(data) {
        return await sequelize.transaction(async (transaction) => {
            const sucursal = await models.Sucursal.create(data, {
                transaction,
            });

            await models.Correlativo.bulkCreate(
                [
                    {
                        sucursalId: sucursal.id,
                        tipoDoc: 'FCF',
                        serie: 'A',
                        ultimoNumero: 0,
                    },
                    {
                        sucursalId: sucursal.id,
                        tipoDoc: 'CCF',
                        serie: 'A',
                        ultimoNumero: 0,
                    },
                ],
                { transaction }
            );

            return await models.Sucursal.findByPk(sucursal.id, {
                include: [
                    {
                        association: 'correlativos',
                    },
                ],
                transaction,
            });
        });
    }

    async update(id, data) {
        const sucursal = await this.findOne(id);
        return await sucursal.update(data);
    }
}

module.exports = { SucursalService };
