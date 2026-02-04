require('dotenv').config();
const { Client } = require('pg');

async function deleteDb() {
    console.log('Deleting database...');

    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL is not defined in .env');
        process.exit(1);
    }

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

    // Connect to 'postgres' database to perform administrative tasks
    urlObj.pathname = '/postgres';
    const postgresUrl = urlObj.toString();

    const maintenanceClient = new Client({
        connectionString: postgresUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await maintenanceClient.connect();
        console.log('Connected to maintenance DB (postgres).');

        // Check if database exists
        const res = await maintenanceClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDbName]);

        if (res.rowCount === 0) {
            console.log(`Database '${targetDbName}' does not exist.`);
        } else {
            console.log(`Database '${targetDbName}' exists. Terminating connections...`);

            // Terminate other connections to the database
            await maintenanceClient.query(`
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = $1
                  AND pid <> pg_backend_pid()
            `, [targetDbName]);

            console.log(`Dropping database '${targetDbName}'...`);
            await maintenanceClient.query(`DROP DATABASE "${targetDbName}"`);
            console.log(`Database '${targetDbName}' deleted successfully.`);
        }

    } catch (err) {
        console.error('Error deleting database:', err);
        process.exit(1);
    } finally {
        await maintenanceClient.end();
    }
}

deleteDb();
