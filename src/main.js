const { config } = require('./config/config.env');
const { createApp } = require('./app');
const sequelize = require('./db/config.db');

const app = createApp();

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a PostgreSQL establecida correctamente.');

        if (process.env.DB_SYNC === 'true') {
            await sequelize.sync({ alter: true });
            console.log('Tablas sincronizadas con los modelos.');
        }

        app.listen(config.port, () => {
            console.log('Api in port:', config.port);
        });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        process.exit(1);
    }
}

startServer();