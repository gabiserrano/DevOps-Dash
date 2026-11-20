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

const getProductoController = async (req, res, next) => {
  try {
    const producto = await service.findOne(req.params.id);
    res.status(200).json({
      data: producto,
    });
  } catch (error) {
    next(error);
  }
};

const createProductoController = async (req, res, next) => {
  try {
    const nuevoProducto = await service.create(req.body);
    res.status(201).json({
      message: 'Producto creado exitosamente',
      data: nuevoProducto,
    });
  } catch (error) {
    next(error);
  }
};

const updateProductoController = async (req, res, next) => {
  try {
    const productoActualizado = await service.update(req.params.id, req.body);
    res.status(200).json({
      message: 'Producto actualizado exitosamente',
      data: productoActualizado,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductosController,
  getProductoController,
  createProductoController,
  updateProductoController,
};