const { models } = require('../db/config.db');

class ProductoService {
    async findAll(query = {}) {
        const { limit, offset, categoria, tipo, activo, search } = query;

        const options = {
            where: {},
            include: [
                {
                    association: 'insumo',
                    attributes: ['id', 'nombre', 'unidad', 'costoPromedio'],
                },
            ],
            order: [['id', 'ASC']],
        };

        if (limit !== undefined) {
            options.limit = limit;
        }
        if (offset !== undefined) {
            options.offset = offset;
        }
        if (categoria) {
            options.where.categoria = categoria;
        }
        if (tipo) {
            options.where.tipo = tipo;
        }
        if (activo !== undefined) {
            options.where.activo = activo;
        }
        if (search) {
            options.where.nombre = {
                [Op.iLike]: `%${search}%`,
            };
        }

        const productos = await models.Producto.findAll(options);
        return productos;
    }
    async create(data) {
        // 1. Si es de reventa, validamos que el insumo vinculado realmente exista
        if (data.tipo === 'reventa') {
            const insumo = await models.Insumo.findByPk(data.insumoId);
            if (!insumo) {
                const error = new Error(`El insumo con id ${data.insumoId} no existe`);
                error.statusCode = 404;
                throw error;
            }
        } else {
            // Si es elaborado, nos aseguramos de que insumoId vaya en null
            data.insumoId = null;
        }

        // 2. Creamos el producto (si el nombre ya existe, Sequelize lanza UniqueConstraintError)
        const nuevoProducto = await models.Producto.create(data);
        return nuevoProducto;
    }
}

module.exports = { ProductoService };