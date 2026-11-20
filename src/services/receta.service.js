
const sequelize = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');

const { Producto, Insumo, Receta } = sequelize.models;

class RecetaService {

    // GET /producto/:productoId
    async findByProducto(productoId) {
        const producto = await Producto.findByPk(productoId, {
            include: [
                {
                    association: 'receta',
                    include: [
                        {
                            association: 'insumo',
                            attributes: [
                                'id',
                                'nombre',
                                'unidad',
                                'costoPromedio'
                            ]
                        }
                    ]
                }
            ]
        });

        if (!producto) {
            throw new HttpError(
                404,
                `El producto con ID ${productoId} no existe`
            );
        }

        if (producto.tipo !== 'elaborado') {
            throw new HttpError(
                400,
                'Solo los productos elaborados tienen receta'
            );
        }

        return producto;
    }

    // POST / - Crear o reemplazar receta completa
    async create(data) {
        const { productoId, ingredientes } = data;

        if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
            throw new HttpError(
                400,
                'La receta debe contener al menos un ingrediente'
            );
        }

        const idsInsumos = ingredientes.map(
            ingrediente => ingrediente.insumoId
        );

        const idsUnicos = new Set(idsInsumos);

        if (idsUnicos.size !== idsInsumos.length) {
            throw new HttpError(
                400,
                'No puedes repetir el mismo insumo en una receta'
            );
        }

        // La transacción evita guardar una receta incompleta.
        await sequelize.transaction(async (transaction) => {

            // Bloqueamos el producto mientras reemplazamos su receta.
            const producto = await Producto.findByPk(productoId, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!producto) {
                throw new HttpError(
                    404,
                    `El producto con ID ${productoId} no existe`
                );
            }

            if (producto.tipo !== 'elaborado') {
                throw new HttpError(
                    400,
                    'No se pueden asignar recetas a productos de reventa'
                );
            }

            // Validar los ingredientes antes de borrar la receta anterior.
            for (const ingrediente of ingredientes) {
                const insumo = await Insumo.findByPk(
                    ingrediente.insumoId,
                    { transaction }
                );

                if (!insumo) {
                    throw new HttpError(
                        404,
                        `El insumo con ID ${ingrediente.insumoId} no existe`
                    );
                }

                if (!insumo.activo) {
                    throw new HttpError(
                        400,
                        `El insumo ${insumo.nombre} está inactivo`
                    );
                }

                if (
                    !Number.isFinite(Number(ingrediente.cantidad)) ||
                    Number(ingrediente.cantidad) <= 0
                ) {
                    throw new HttpError(
                        400,
                        'La cantidad de cada ingrediente debe ser mayor que cero'
                    );
                }
            }

            // Eliminar los ingredientes anteriores.
            await Receta.destroy({
                where: { productoId },
                transaction
            });

            // Registrar la receta nueva.
            const nuevosIngredientes = ingredientes.map(
                ingrediente => ({
                    productoId,
                    insumoId: ingrediente.insumoId,
                    cantidad: ingrediente.cantidad
                })
            );

            await Receta.bulkCreate(nuevosIngredientes, {
                transaction
            });
        });

        // Devolver la receta completa, con nombres y unidades.
        return this.findByProducto(productoId);
    }

    // PATCH /:id - Editar cantidad de un ingrediente
    async update(id, changes) {
        const ingrediente = await Receta.findByPk(id);

        if (!ingrediente) {
            throw new HttpError(
                404,
                `El ingrediente de receta con ID ${id} no existe`
            );
        }

        if (
            !Number.isFinite(Number(changes.cantidad)) ||
            Number(changes.cantidad) <= 0
        ) {
            throw new HttpError(
                400,
                'La cantidad debe ser mayor que cero'
            );
        }

        await ingrediente.update({
            cantidad: changes.cantidad
        });

        return Receta.findByPk(id, {
            include: [
                {
                    association: 'insumo',
                    attributes: [
                        'id',
                        'nombre',
                        'unidad',
                        'costoPromedio'
                    ]
                }
            ]
        });
    }

    // DELETE /:id - Eliminar ingrediente de receta
    async delete(id) {
        const ingrediente = await Receta.findByPk(id);

        if (!ingrediente) {
            throw new HttpError(
                404,
                `El ingrediente de receta con ID ${id} no existe`
            );
        }

        await ingrediente.destroy();

        return {
            message: 'Ingrediente eliminado correctamente'
        };
    }
}

module.exports = { RecetaService };
