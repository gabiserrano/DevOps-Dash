const cors = require('cors');

const { config } = require('./config/config.env');
const { createApp } = require('./app');
require('./db/config');


const app = createApp();
app.use(cors());

app.listen(config.port, () => {
    console.log('Api in port: ', config.port);
});