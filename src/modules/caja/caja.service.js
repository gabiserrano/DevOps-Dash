const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');
const { ErrorNegocio } = require('../../utils/errors');

function formatearCaja(c) {
  return {
    id: c.id,
    sucursal_id: c.sucursal_id,
    usuario_id: c.usuario_id,
    turno: c.turno,
    fecha_apertura: c.fecha_apertura,
    monto_inicial: Number(c.monto_inicial),
    estado: c.estado,
  };
}

async function abrirCaja({ usuarioId, turno, montoInicial }) {
  const [usuario] = await sequelize.query(
    'SELECT id, sucursal_id FROM usuarios WHERE id = :usuarioId AND activo = TRUE',
    { replacements: { usuarioId }, type: QueryTypes.SELECT }
  );
  if (!usuario) {
    throw new ErrorNegocio('Usuario no encontrado o inactivo', 404);
  }

  const [abierta] = await sequelize.query(
    "SELECT id FROM cajas WHERE usuario_id = :usuarioId AND estado = 'abierta'",
    { replacements: { usuarioId }, type: QueryTypes.SELECT }
  );
  if (abierta) {
    throw new ErrorNegocio(
      `Ya tienes una caja abierta (id ${abierta.id}). Ciérrala antes de abrir otra`,
      409
    );
  }

  try {
    const [filas] = await sequelize.query(
      `INSERT INTO cajas (sucursal_id, usuario_id, turno, monto_inicial)
       VALUES (:sucursalId, :usuarioId, :turno, :montoInicial)
       RETURNING id, sucursal_id, usuario_id, turno, fecha_apertura, monto_inicial, estado`,
      {
        replacements: {
          sucursalId: usuario.sucursal_id,
          usuarioId,
          turno,
          montoInicial: Math.round(montoInicial * 100) / 100,
        },
      }
    );
    return formatearCaja(filas[0]);
  } catch (err) {
    // El índice único de la BD evita dos cajas abiertas aunque lleguen dos peticiones a la vez
    if (err.name === 'SequelizeUniqueConstraintError' || err.original?.code === '23505') {
      throw new ErrorNegocio('Ya tienes una caja abierta', 409);
    }
    throw err;
  }
}

async function obtenerCajaAbierta(usuarioId) {
  const [caja] = await sequelize.query(
    `SELECT id, sucursal_id, usuario_id, turno, fecha_apertura, monto_inicial, estado
     FROM cajas WHERE usuario_id = :usuarioId AND estado = 'abierta'`,
    { replacements: { usuarioId }, type: QueryTypes.SELECT }
  );
  if (!caja) {
    throw new ErrorNegocio('No hay una caja abierta para este usuario', 404);
  }
  return formatearCaja(caja);
}

module.exports = { abrirCaja, obtenerCajaAbierta };