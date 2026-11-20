const { Op } = require('sequelize');
const sequelize = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');
const {
  escalar,
  centavosATexto,
  cantidadATexto,
  costoATexto,
  redondearPositivo,
  validarImporte,
} = require('../helpers/math.helper');
const { sumarDias } = require('../helpers/date.helper');
const { registrarEntradaCompra } = require('../helpers/inventario.helper');

const { models } = sequelize;

class CompraService {
  async findAll(query = {}) {
    const {
      limit,
      offset,
      sucursalId,
      proveedorId,
      tipoPago,
      clasificacion,
      fechaInicio,
      fechaFin,
    } = query;

    const options = {
      where: {},
      include: [
        { association: 'proveedor', attributes: ['id', 'nombre'] },
        { association: 'sucursal', attributes: ['id', 'nombre'] },
      ],
      order: [['id', 'DESC']],
    };

    if (limit !== undefined) options.limit = Number(limit);
    if (offset !== undefined) options.offset = Number(offset);
    if (sucursalId !== undefined) options.where.sucursalId = sucursalId;
    if (proveedorId !== undefined) options.where.proveedorId = proveedorId;
    if (tipoPago) options.where.tipoPago = tipoPago;
    if (clasificacion) options.where.clasificacion = clasificacion;

    if (fechaInicio || fechaFin) {
      options.where.fecha = {};
      if (fechaInicio) options.where.fecha[Op.gte] = fechaInicio;
      if (fechaFin) options.where.fecha[Op.lte] = fechaFin;
    }

    return models.Compra.findAll(options);
  }

  async findOne(id) {
    const compra = await models.Compra.findByPk(id, {
      include: [
        { association: 'proveedor', attributes: ['id', 'nombre', 'diasCredito'] },
        { association: 'sucursal', attributes: ['id', 'nombre'] },
        {
          association: 'detalles',
          include: [{ association: 'insumo', attributes: ['id', 'nombre', 'unidad'] }],
        },
        {
          association: 'cuentaPorPagar',
          include: [{ association: 'pagos' }],
        },
      ],
    });

    if (!compra) {
      throw new HttpError(404, `La compra con ID ${id} no existe`);
    }

    return compra;
  }

  async create(data) {
    const ids = data.detalles.map((d) => d.insumoId);
    if (new Set(ids).size !== ids.length) {
      throw new HttpError(400, 'No repitas un insumo dentro de la misma compra');
    }

    const fechaNormalizada = sumarDias(data.fecha, 0);

    const detallesCalculados = data.detalles.map((d, i) => {
      const cantidadEscalada = escalar(d.cantidad, 3, `detalles[${i}].cantidad`);
      const costoUnitarioEscalado = escalar(d.costoUnitario, 4, `detalles[${i}].costoUnitario`);

      if (cantidadEscalada === 0n) {
        throw new HttpError(400, 'La cantidad debe ser mayor que cero');
      }

      const subtotalCentavos = redondearPositivo(cantidadEscalada * costoUnitarioEscalado, 100000n);
      validarImporte(subtotalCentavos);

      if (d.subtotal !== undefined) {
        const subtotalEnviado = escalar(d.subtotal, 2, `detalles[${i}].subtotal`);
        if (subtotalEnviado !== subtotalCentavos) {
          throw new HttpError(400, `detalles[${i}].subtotal no coincide con cantidad * costoUnitario`);
        }
      }

      return {
        insumoId: d.insumoId,
        cantidadEscalada,
        costoUnitarioEscalado,
        cantidadTexto: cantidadATexto(cantidadEscalada),
        costoUnitarioTexto: costoATexto(costoUnitarioEscalado),
        subtotalTexto: centavosATexto(subtotalCentavos),
        subtotalCentavos,
      };
    });

    const subtotal = detallesCalculados.reduce((acc, d) => acc + d.subtotalCentavos, 0n);
    const iva = data.iva !== undefined
      ? escalar(data.iva, 2, 'iva')
      : (data.aplicaIva === false ? 0n : redondearPositivo(subtotal * 13n, 100n));
    const total = subtotal + iva;

    [subtotal, iva, total].forEach(validarImporte);

    if (data.subtotal !== undefined && escalar(data.subtotal, 2, 'subtotal') !== subtotal) {
      throw new HttpError(400, 'El subtotal de la compra no coincide con la suma de sus detalles');
    }
    if (data.total !== undefined && escalar(data.total, 2, 'total') !== total) {
      throw new HttpError(400, 'El total de la compra no coincide con subtotal + iva');
    }

    const compraId = await sequelize.transaction(async (transaction) => {
      const [sucursal, proveedor, insumos] = await Promise.all([
        models.Sucursal.findByPk(data.sucursalId, { transaction }),
        models.Proveedor.findByPk(data.proveedorId, { transaction }),
        models.Insumo.findAll({
          where: { id: { [Op.in]: ids }, activo: true },
          transaction,
          lock: transaction.LOCK.UPDATE,
        }),
      ]);

      if (!sucursal || !sucursal.activa) {
        throw new HttpError(400, 'Sucursal inexistente o inactiva');
      }
      if (!proveedor || !proveedor.activo) {
        throw new HttpError(400, 'Proveedor inexistente o inactivo');
      }
      if (insumos.length !== ids.length) {
        throw new HttpError(400, 'Algún insumo no existe o está inactivo');
      }

      const insumosMap = new Map(insumos.map((ins) => [ins.id, ins]));

      const compra = await models.Compra.create(
        {
          sucursalId: data.sucursalId,
          proveedorId: data.proveedorId,
          numeroFactura: data.numeroFactura.trim(),
          fecha: fechaNormalizada,
          tipoPago: data.tipoPago,
          clasificacion: data.clasificacion ?? 'costo',
          subtotal: centavosATexto(subtotal),
          iva: centavosATexto(iva),
          total: centavosATexto(total),
          usuarioId: data.usuarioId ?? null,
        },
        { transaction }
      );

      await models.CompraDetalle.bulkCreate(
        detallesCalculados.map((d) => ({
          compraId: compra.id,
          insumoId: d.insumoId,
          cantidad: d.cantidadTexto,
          costoUnitario: d.costoUnitarioTexto,
          subtotal: d.subtotalTexto,
        })),
        { transaction }
      );

      for (const detalle of detallesCalculados) {
        await registrarEntradaCompra(
          models,
          {
            sucursalId: data.sucursalId,
            insumo: insumosMap.get(detalle.insumoId),
            cantidadEscalada: detalle.cantidadEscalada,
            costoUnitarioEscalado: detalle.costoUnitarioEscalado,
            compraId: compra.id,
            usuarioId: data.usuarioId ?? null,
          },
          transaction
        );
      }

      if (data.tipoPago === 'credito') {
        await models.CuentaPorPagar.create(
          {
            compraId: compra.id,
            proveedorId: data.proveedorId,
            montoTotal: centavosATexto(total),
            saldo: centavosATexto(total),
            fechaVencimiento: sumarDias(fechaNormalizada, Number(proveedor.diasCredito)),
            estado: 'pendiente',
          },
          { transaction }
        );
      }

      return compra.id;
    });

    return this.findOne(compraId);
  }

  async registrarPagoCxp(cxpId, data) {
    const monto = escalar(data.monto, 2, 'monto');
    if (monto === 0n) {
      throw new HttpError(400, 'El pago debe ser mayor que cero');
    }
    validarImporte(monto);

    return sequelize.transaction(async (transaction) => {
      const cuenta = await models.CuentaPorPagar.findByPk(cxpId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!cuenta) {
        throw new HttpError(404, 'Cuenta por pagar no encontrada');
      }

      const saldo = escalar(cuenta.saldo, 2, 'saldo');
      if (monto > saldo) {
        throw new HttpError(400, 'El pago supera el saldo pendiente');
      }

      if (data.metodoPagoId != null) {
        const metodo = await models.MetodoPago.findByPk(data.metodoPagoId, { transaction });
        if (!metodo) {
          throw new HttpError(400, 'Método de pago no encontrado');
        }
      }

      const pago = await models.PagoCxp.create(
        {
          cxpId: cuenta.id,
          monto: centavosATexto(monto),
          metodoPagoId: data.metodoPagoId ?? null,
          usuarioId: data.usuarioId ?? null,
        },
        { transaction }
      );

      const saldoRestante = saldo - monto;
      await cuenta.update(
        {
          saldo: centavosATexto(saldoRestante),
          estado: saldoRestante === 0n ? 'pagada' : 'parcial',
        },
        { transaction }
      );

      return { pago, cuentaPorPagar: cuenta };
    });
  }
}

module.exports = { CompraService };