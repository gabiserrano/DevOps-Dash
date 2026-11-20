#!/usr/bin/env node
/**
 * Carga el esquema y los datos de prueba sin necesidad de psql ni Docker CLI.
 *
 *   npm run db:seed -- --force
 *
 * Requiere DB_URL en el .env del backend. OJO: script.sql hace
 * DROP SCHEMA public CASCADE, así que borra todo lo que haya en la base.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const DB_URL = process.env.DB_URL;
const ESQUEMA = path.join(__dirname, '..', 'documents', 'script.sql');
const SEEDER = path.join(__dirname, '..', 'documents', 'seeder.sql');

async function ejecutar(client, archivo, etiqueta) {
    const sql = fs.readFileSync(archivo, 'utf8');
    process.stdout.write(`→ ${etiqueta} ... `);
    await client.query(sql);
    console.log('OK');
}

(async () => {
    if (!DB_URL) {
        console.error('Falta DB_URL. Copiá .env.example a .env y ajustá la conexión.');
        process.exit(1);
    }

    if (!process.argv.includes('--force')) {
        console.error('Este comando BORRA el esquema public y recarga los datos de prueba.');
        console.error('Si es lo que querés, ejecutá: npm run db:seed -- --force');
        process.exit(1);
    }

    const client = new Client({ connectionString: DB_URL });
    await client.connect();

    try {
        await ejecutar(client, ESQUEMA, 'script.sql (esquema + datos base)');
        await ejecutar(client, SEEDER, 'seeder.sql (datos de prueba)');

        const tablas = await client.query(
            "select count(*)::int as total from information_schema.tables where table_schema = 'public'"
        );

        const usuarios = await client.query(`
            select u.email, r.nombre as rol, s.nombre as sucursal
            from usuarios u
            join roles r on r.id = u.rol_id
            join sucursales s on s.id = u.sucursal_id
            order by u.id
        `);

        console.log(`\nTablas creadas: ${tablas.rows[0].total}`);
        console.log('Usuarios cargados:');
        for (const usuario of usuarios.rows) {
            console.log(`  ${usuario.email.padEnd(34)} ${usuario.rol.padEnd(9)} ${usuario.sucursal}`);
        }
        console.log('\nContraseña de todos los usuarios: Origenes2026');
    } finally {
        await client.end();
    }
})().catch((error) => {
    console.error('\nERROR:', error.message);
    process.exit(1);
});
