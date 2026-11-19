const { ProductoService } = require('../services/producto.service');

const service = new ProductoService();

const getProductosController = async (req, res, next) => {
  try {
    const productos = await service.findAll(req.query);

    res.status(200).json({
      data: productos,
    });
  } catch (error) {
    next(error);
  }
};

const createProductoController = async (req, res, next) => {
  try {
    const body = req.body;
    const nuevoProducto = await service.create(body);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      data: nuevoProducto,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProductoController,
  getProductosController
};