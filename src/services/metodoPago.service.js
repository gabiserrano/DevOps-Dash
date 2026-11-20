const { models } = require('../db/config.db');

class MetodoPagoService {
    async findAll() {
        return models.MetodoPago.findAll({
            attributes: ['id', 'nombre', 'esEfectivo'],
            order: [['id', 'ASC']],
        });
    }
}

module.exports = { MetodoPagoService };
