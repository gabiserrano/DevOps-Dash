const sequelize = require('./config/db');

(async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query('SELECT COUNT(*)::int AS usuarios FROM usuarios');
    console.log('Conexión OK. Usuarios en la base:', rows[0].usuarios);
    process.exit(0);
  } catch (err) {
    console.error('Error de conexión:', err.message);
    process.exit(1);
  }
})();