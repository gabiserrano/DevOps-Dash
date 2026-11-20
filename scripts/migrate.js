#!/usr/bin/env node
/**
 * Aplica migraciones incrementales (no destructivas) sobre una base existente.
 *
 *   npm run db:migrate
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const DB_URL = process.env.DB_URL;
const MIGRACIONES = ['migracion_inventario.sql'];

(async () => {
    if (!DB_URL) {
        console.error('Falta DB_URL. Copiá .env.example a .env y ajustá la conexión.');
        process.exit(1);
    }

    const client = new Client({ connectionString: DB_URL });
    await client.connect();

    try {
        for (const archivo of MIGRACIONES) {
            const ruta = path.join(__dirname, '..', 'documents', archivo);
            const sql = fs.readFileSync(ruta, 'utf8');
            process.stdout.write(`→ ${archivo} ... `);
            await client.query(sql);
            console.log('OK');
        }
        console.log('\nMigraciones aplicadas.');
    } finally {
        await client.end();
    }
})().catch((error) => {
    console.error('\nERROR:', error.message);
    process.exit(1);
});
