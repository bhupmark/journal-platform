require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

async function initDb() {
    console.log('Initializing database...');

    // 1. connect to default 'postgres' db to check/create journal_db
    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    // Parse URL to replace dbname with 'postgres'
    let urlObj;
    try {
        urlObj = new URL(dbUrl);
    } catch (e) {
        console.error('Invalid DATABASE_URL:', e.message);
        process.exit(1);
    }

    const targetDbName = urlObj.pathname.split('/')[1];
    if (!targetDbName) {
        console.error('Database name not found in connection string');
        process.exit(1);
    }

    urlObj.pathname = '/postgres';
    const postgresUrl = urlObj.toString();

    const maintenanceClient = new Client({
        connectionString: postgresUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await maintenanceClient.connect();
        console.log('Connected to maintenance DB (postgres).');

        // Check if target DB exists
        const res = await maintenanceClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDbName]);
        if (res.rowCount === 0) {
            console.log(`Database '${targetDbName}' does not exist. Creating...`);
            // CREATE DATABASE cannot run inside a transaction block, so we use simple query
            await maintenanceClient.query(`CREATE DATABASE "${targetDbName}"`);
            console.log(`Database '${targetDbName}' created successfully.`);
        } else {
            console.log(`Database '${targetDbName}' already exists.`);
        }

        await maintenanceClient.end();
    } catch (err) {
        console.error('Error connecting to maintenance DB:', err.message);
        console.log('Attempting to connect directly to target DB in case it exists and we do not have access to postgres db...');
    }

    // 2. Connect to the target DB and run schema
    const client = new Client({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        console.log(`Connected to ${targetDbName}.`);

        console.log('Running schema...');
        await client.query(schemaSql);
        console.log('Schema applied successfully.');

    } catch (err) {
        console.error('Error applying schema:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

initDb();
