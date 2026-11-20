const { HttpError } = require('./httpError.helper');

function escalar(valor, decimales, campo = 'valor') {
    const texto = String(valor);
    const patron = new RegExp(`^\\d+(?:\\.\\d{1,${decimales}})?$`);
    if (!patron.test(texto)) {
        throw new HttpError(400, `${campo}: número inválido (máximo ${decimales} decimales)`);
    }
    const [entera, decimal = ''] = texto.split('.');
    return BigInt(entera) * 10n ** BigInt(decimales) + BigInt(decimal.padEnd(decimales, '0') || '0');
}

function escalarDesdeBd(valor, decimales) {
    const fijo = Number(valor || 0).toFixed(decimales);
    const [entera, decimal = ''] = fijo.split('.');
    return BigInt(entera) * 10n ** BigInt(decimales) + BigInt(decimal);
}

function aDecimalTexto(valorEscalado, decimales) {
    const factor = 10n ** BigInt(decimales);
    const entera = valorEscalado / factor;
    const decimal = String(valorEscalado % factor).padStart(decimales, '0');
    return `${entera}.${decimal}`;
}

function centavosATexto(valor) {
    return aDecimalTexto(valor, 2);
}

function cantidadATexto(valor) {
    return aDecimalTexto(valor, 3);
}

function costoATexto(valor) {
    return aDecimalTexto(valor, 4);
}

function redondearPositivo(numerador, denominador) {
    return (numerador + denominador / 2n) / denominador;
}

function validarImporte(centavos) {
    // NUMERIC(12, 2): máximo 10 dígitos enteros
    if (centavos < 0n || centavos > 999999999999n) {
        throw new HttpError(400, 'Importe fuera del rango permitido');
    }
}

module.exports = {
    escalar,
    escalarDesdeBd,
    centavosATexto,
    cantidadATexto,
    costoATexto,
    redondearPositivo,
    validarImporte,
};