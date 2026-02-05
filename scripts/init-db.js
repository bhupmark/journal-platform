require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

async function initDb() {
    console.log('Initializing MySQL database...');

    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'journal_db';

    if (!dbHost || !dbUser) {
        console.error('DB_HOST and DB_USER are required in .env');
        process.exit(1);
    }

    // 1. Connect to MySQL server (without database) to create database if it doesn't exist
    let connection;
    try {
        connection = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword
        });
        console.log('Connected to MySQL server.');

        // Check if database exists
        const [dbs] = await connection.query(`SHOW DATABASES LIKE ?`, [dbName]);
        if (dbs.length === 0) {
            console.log(`Database '${dbName}' does not exist. Creating...`);
            await connection.query(`CREATE DATABASE ${mysql.escapeId(dbName)}`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }

        await connection.end();
    } catch (err) {
        console.error('Error connecting to MySQL:', err.message);
        process.exit(1);
    }

    // 2. Connect to the target database and run schema
    try {
        connection = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword,
            database: dbName
        });
        console.log(`Connected to database '${dbName}'.`);

        // Split schema by semicolons and execute each statement
        console.log('Running schema...');
        const statements = schemaSql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }
        
        console.log('Schema applied successfully.');
        await connection.end();
    } catch (err) {
        console.error('Error applying schema:', err.message);
        process.exit(1);
    }
}

initDb();
