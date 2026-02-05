require('dotenv').config();
const mysql = require('mysql2/promise');

async function deleteDb() {
    console.log('Deleting MySQL database...');

    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'journal_db';

    if (!dbHost || !dbUser) {
        console.error('DB_HOST and DB_USER are required in .env');
        process.exit(1);
    }

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
            console.log(`Database '${dbName}' does not exist.`);
        } else {
            console.log(`Database '${dbName}' exists. Dropping...`);
            await connection.query(`DROP DATABASE ${mysql.escapeId(dbName)}`);
            console.log(`Database '${dbName}' deleted successfully.`);
        }

    } catch (err) {
        console.error('Error deleting database:', err.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

deleteDb();
