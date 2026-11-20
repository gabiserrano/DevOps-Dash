const { HttpError } = require('./httpError.helper');

function normalizarFechaISO(fecha) {
    return fecha instanceof Date
        ? fecha.toISOString().slice(0, 10)
        : String(fecha).slice(0, 10);
}

function sumarDias(fecha, dias) {
    const fechaStr = normalizarFechaISO(fecha);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        throw new HttpError(400, 'Fecha inválida: usa YYYY-MM-DD');
    }

    const base = new Date(`${fechaStr}T00:00:00.000Z`);
    if (Number.isNaN(base.getTime()) || base.toISOString().slice(0, 10) !== fechaStr) {
        throw new HttpError(400, 'Fecha inválida');
    }

    if (!Number.isInteger(dias) || dias < 0) {
        throw new HttpError(400, 'Los días de crédito son inválidos');
    }

    base.setUTCDate(base.getUTCDate() + dias);
    return base.toISOString().slice(0, 10);
}

module.exports = {
    normalizarFechaISO,
    sumarDias,
};