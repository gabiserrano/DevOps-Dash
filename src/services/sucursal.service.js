const { Op } = require('sequelize');
const sequelize = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');

const { models } = sequelize;

class SucursalService {
    async findAll(query = {}) {
        const { limit, offset, activa, search } = query;

        const options = {
            where: {},
            order: [['id', 'ASC']],
        };

        if (limit !== undefined) options.limit = Number(limit);
        if (offset !== undefined) options.offset = Number(offset);
        if (activa !== undefined) options.where.activa = activa;

        if (search) {
            options.where.nombre = {
                [Op.iLike]: `%${search}%`,
            };
        }

        return models.Sucursal.findAll(options);
    }

    async findOne(id) {
        const sucursal = await models.Sucursal.findByPk(id, {
            include: [
                {
                    association: 'correlativos',
                    attributes: ['id', 'tipoDoc', 'serie', 'ultimoNumero'],
                },
            ],
        });

        if (!sucursal) {
            throw new HttpError(404, `La sucursal con ID ${id} no existe`);
        }

        return sucursal;
    }

    async create(data) {
        const sucursalId = await sequelize.transaction(async (transaction) => {
            const nuevaSucursal = await models.Sucursal.create(data, { transaction });

            // Inicializa automáticamente los correlativos base para FCF y CCF en la sucursal
            await models.Correlativo.bulkCreate(
                [
                    {
                        sucursalId: nuevaSucursal.id,
                        tipoDoc: 'FCF',
                        serie: 'A',
                        ultimoNumero: 0,
                    },
                    {
                        sucursalId: nuevaSucursal.id,
                        tipoDoc: 'CCF',
                        serie: 'A',
                        ultimoNumero: 0,
                    },
                ],
                { transaction }
            );

            return nuevaSucursal.id;
        });

        return this.findOne(sucursalId);
    }

    async update(id, changes) {
        const sucursal = await this.findOne(id);
        await sucursal.update(changes);
        return this.findOne(id);
    }
}

module.exports = { SucursalService };