'use strict';

const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../db/config.db');

// Los modelos se registran una sola vez al iniciar la aplicación:
// setupModels(sequelize), desde src/db/models/index.js.
function modelos() {
  const { Compra, CompraDetalle, CuentaPorPagar, PagoCxp, Sucursal, Proveedor, Insumo } = sequelize.models;
  if (![Compra, CompraDetalle, CuentaPorPagar, PagoCxp, Sucursal, Proveedor, Insumo].every(Boolean)) {
    throw new Error('Los modelos no están inicializados. Ejecuta setupModels(sequelize) al arrancar la aplicación.');
  }
  return { Compra, CompraDetalle, CuentaPorPagar, PagoCxp, Sucursal, Proveedor, Insumo };
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function escalar(valor, decimales, campo) {
  const texto = String(valor);
  const patron = new RegExp(`^\\d+(?:\\.\\d{1,${decimales}})?$`);
  if (!patron.test(texto)) {
    throw new HttpError(400, `${campo}: número inválido (máximo ${decimales} decimales)`);
  }
  const [entera, decimal = ''] = texto.split('.');
  return BigInt(entera) * 10n ** BigInt(decimales) + BigInt(decimal.padEnd(decimales, '0') || '0');
}

function centavosATexto(valor) {
  return `${valor / 100n}.${String(valor % 100n).padStart(2, '0')}`;
}

function redondearPositivo(numerador, denominador) {
  return (numerador + denominador / 2n) / denominador;
}

function validarImporte(centavos) {
  // NUMERIC(12, 2): como máximo 10 dígitos enteros.
  if (centavos < 0n || centavos > 999999999999n) {
    throw new HttpError(400, 'Importe fuera del rango permitido');
  }
}

function validarId(valor, campo) {
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new HttpError(400, `${campo} debe ser un entero positivo`);
  }
  return id;
}

function sumarDias(fecha, dias) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new HttpError(400, 'Fecha inválida: usa YYYY-MM-DD');
  }
  const base = new Date(`${fecha}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime()) || base.toISOString().slice(0, 10) !== fecha) {
    throw new HttpError(400, 'Fecha de compra inválida');
  }
  if (!Number.isInteger(dias) || dias < 0) {
    throw new HttpError(400, 'Los días de crédito del proveedor son inválidos');
  }
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

async function listar(filtros = {}) {
  const { Compra } = modelos();
  const pagina = Number(filtros.pagina ?? 1);
  const limite = Number(filtros.limite ?? 20);
  if (!Number.isSafeInteger(pagina) || pagina < 1 || !Number.isSafeInteger(limite) || limite < 1 || limite > 100) {
    throw new HttpError(400, 'Paginación inválida');
  }
  const where = {};
  if (filtros.sucursalId != null) where.sucursalId = validarId(filtros.sucursalId, 'sucursalId');
  if (filtros.proveedorId != null) where.proveedorId = validarId(filtros.proveedorId, 'proveedorId');

  const { count, rows } = await Compra.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit: limite,
    offset: (pagina - 1) * limite,
    distinct: true
  });
  return { total: count, pagina, limite, compras: rows };
}

async function obtener(id) {
  const { Compra } = modelos();
  const compra = await Compra.findByPk(validarId(id, 'id'), {
    include: [
      { association: 'proveedor', attributes: ['id', 'nombre'] },
      { association: 'sucursal', attributes: ['id', 'nombre'] },
      {
        association: 'detalles',
        include: [{ association: 'insumo', attributes: ['id', 'nombre', 'unidad'] }]
      },
      { association: 'cuentaPorPagar' }
    ]
  });
  if (!compra) throw new HttpError(404, 'Compra no encontrada');
  return compra;
}

async function crear(datos) {
  const { Compra, CompraDetalle, CuentaPorPagar, Sucursal, Proveedor, Insumo } = modelos();
  if (!datos || !Array.isArray(datos.detalles) || datos.detalles.length === 0) {
    throw new HttpError(400, 'La compra debe incluir al menos un insumo');
  }
  const sucursalId = validarId(datos.sucursalId, 'sucursalId');
  const proveedorId = validarId(datos.proveedorId, 'proveedorId');
  const usuarioId = datos.usuarioId == null ? null : validarId(datos.usuarioId, 'usuarioId');
  if (typeof datos.numeroFactura !== 'string' || !datos.numeroFactura.trim() || datos.numeroFactura.length > 40) {
    throw new HttpError(400, 'Número de factura inválido');
  }
  if (!['contado', 'credito'].includes(datos.tipoPago)) {
    throw new HttpError(400, 'tipoPago debe ser contado o credito');
  }
  if (!['costo', 'gasto'].includes(datos.clasificacion ?? 'costo')) {
    throw new HttpError(400, 'Clasificación inválida');
  }
  if (datos.aplicaIva != null && typeof datos.aplicaIva !== 'boolean') {
    throw new HttpError(400, 'aplicaIva debe ser booleano');
  }
  // Valida la fecha aun cuando sea de contado.
  sumarDias(datos.fecha, 0);

  const ids = datos.detalles.map(d => validarId(d?.insumoId, 'insumoId'));
  if (new Set(ids).size !== ids.length) {
    throw new HttpError(400, 'No repitas un insumo dentro de la misma compra');
  }

  const detalles = datos.detalles.map((d, i) => {
    const cantidad = escalar(d.cantidad, 3, `detalles[${i}].cantidad`);
    const costoUnitario = escalar(d.costoUnitario, 4, `detalles[${i}].costoUnitario`);
    if (cantidad === 0n) throw new HttpError(400, 'La cantidad debe ser mayor que cero');
    // cantidad * costoUnitario: escalas 1000 * 10000 -> centavos (100).
    const subtotalCentavos = redondearPositivo(cantidad * costoUnitario, 100000n);
    validarImporte(subtotalCentavos);
    return {
      insumoId: ids[i],
      cantidad: d.cantidad,
      costoUnitario: d.costoUnitario,
      subtotal: centavosATexto(subtotalCentavos),
      subtotalCentavos
    };
  });

  const subtotal = detalles.reduce((suma, detalle) => suma + detalle.subtotalCentavos, 0n);
  const iva = datos.aplicaIva === false ? 0n : redondearPositivo(subtotal * 13n, 100n);
  const total = subtotal + iva;
  [subtotal, iva, total].forEach(validarImporte);

  const compraId = await sequelize.transaction(async (transaction) => {
    const [sucursal, proveedor, insumos] = await Promise.all([
      Sucursal.findByPk(sucursalId, { transaction }),
      Proveedor.findByPk(proveedorId, { transaction }),
      Insumo.findAll({ where: { id: { [Op.in]: ids }, activo: true }, transaction })
    ]);
    if (!sucursal || !sucursal.activa) throw new HttpError(400, 'Sucursal inexistente o inactiva');
    if (!proveedor || !proveedor.activo) throw new HttpError(400, 'Proveedor inexistente o inactivo');
    if (insumos.length !== ids.length) throw new HttpError(400, 'Algún insumo no existe o está inactivo');

    const compra = await Compra.create({
      sucursalId,
      proveedorId,
      numeroFactura: datos.numeroFactura.trim(),
      fecha: datos.fecha,
      tipoPago: datos.tipoPago,
      clasificacion: datos.clasificacion ?? 'costo',
      subtotal: centavosATexto(subtotal),
      iva: centavosATexto(iva),
      total: centavosATexto(total),
      usuarioId
    }, { transaction });

    await CompraDetalle.bulkCreate(detalles.map(d => ({
      compraId: compra.id,
      insumoId: d.insumoId,
      cantidad: d.cantidad,
      costoUnitario: d.costoUnitario,
      subtotal: d.subtotal
    })), { transaction });

    for (const detalle of detalles) {
      // Incremento atómico del stock; PostgreSQL usa UNIQUE(sucursal_id, insumo_id).
      await sequelize.query(`
        INSERT INTO inventario (sucursal_id, insumo_id, stock_actual, stock_minimo)
        VALUES (:sucursalId, :insumoId, :cantidad, 0)
        ON CONFLICT (sucursal_id, insumo_id)
        DO UPDATE SET stock_actual = inventario.stock_actual + EXCLUDED.stock_actual
      `, {
        replacements: { sucursalId, insumoId: detalle.insumoId, cantidad: detalle.cantidad },
        transaction
      });

      await sequelize.query(`
        INSERT INTO movimientos_inventario
          (sucursal_id, insumo_id, tipo, cantidad, motivo, referencia_id, usuario_id)
        VALUES (:sucursalId, :insumoId, 'entrada', :cantidad, 'compra', :compraId, :usuarioId)
      `, {
        replacements: {
          sucursalId, insumoId: detalle.insumoId, cantidad: detalle.cantidad,
          compraId: compra.id, usuarioId
        },
        transaction
      });
    }

    if (datos.tipoPago === 'credito') {
      await CuentaPorPagar.create({
        compraId: compra.id,
        proveedorId,
        montoTotal: centavosATexto(total),
        saldo: centavosATexto(total),
        fechaVencimiento: sumarDias(datos.fecha, Number(proveedor.diasCredito)),
        estado: 'pendiente'
      }, { transaction });
    }
    return compra.id;
  });

  return obtener(compraId);
}

async function registrarPago(cxpId, datos) {
  const { CuentaPorPagar, PagoCxp } = modelos();
  const id = validarId(cxpId, 'cxpId');
  if (!datos) throw new HttpError(400, 'Datos del pago requeridos');
  const monto = escalar(datos.monto, 2, 'monto');
  if (monto === 0n) throw new HttpError(400, 'El pago debe ser mayor que cero');
  validarImporte(monto);
  const metodoPagoId = datos.metodoPagoId == null ? null : validarId(datos.metodoPagoId, 'metodoPagoId');
  const usuarioId = datos.usuarioId == null ? null : validarId(datos.usuarioId, 'usuarioId');

  return sequelize.transaction(async (transaction) => {
    const cuenta = await CuentaPorPagar.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!cuenta) throw new HttpError(404, 'Cuenta por pagar no encontrada');
    const saldo = escalar(cuenta.saldo, 2, 'saldo');
    if (monto > saldo) throw new HttpError(400, 'El pago supera el saldo pendiente');

    if (metodoPagoId != null) {
      const metodos = await sequelize.query(
        'SELECT id FROM metodos_pago WHERE id = :id',
        { replacements: { id: metodoPagoId }, type: QueryTypes.SELECT, transaction }
      );
      if (!metodos.length) throw new HttpError(400, 'Método de pago no encontrado');
    }

    const pago = await PagoCxp.create({
      cxpId: cuenta.id,
      monto: centavosATexto(monto),
      metodoPagoId,
      usuarioId
    }, { transaction });

    const saldoRestante = saldo - monto;
    await cuenta.update({
      saldo: centavosATexto(saldoRestante),
      estado: saldoRestante === 0n ? 'pagada' : 'parcial'
    }, { transaction });

    return { pago, cuentaPorPagar: cuenta };
  });
}

module.exports = { listar, obtener, crear, registrarPago, HttpError };
