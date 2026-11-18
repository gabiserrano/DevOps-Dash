require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const cajaRoutes = require('./modules/caja/caja.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/caja', cajaRoutes);

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
  });
});

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base:', err.message);
    process.exit(1);
  });