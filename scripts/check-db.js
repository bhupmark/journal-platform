require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDb() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'journal_db';

    let connection;
    try {
        connection = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword,
            database: dbName
        });
        console.log('✅ Connected to MySQL database successfully.');

        // List all tables
        const [tables] = await connection.query(
            `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
            [dbName]
        );

        console.log('\n📊 Tables in database:');
        if (tables.length === 0) {
            console.log('   (No tables found)');
        } else {
            tables.forEach(row => {
                console.log(`   - ${row.TABLE_NAME}`);
            });
        }

        // Count users
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log(`\n👥 Users: ${users[0].count}`);

        // Count submissions
        const [submissions] = await connection.query('SELECT COUNT(*) as count FROM submissions');
        console.log(`📄 Submissions: ${submissions[0].count}`);

        // Count articles
        const [articles] = await connection.query('SELECT COUNT(*) as count FROM articles');
        console.log(`📰 Articles: ${articles[0].count}`);

        await connection.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkDb();
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        console.log(`\n👥 Total Users: ${userCount.rows[0].count}`);

    } catch (err) {
        console.error('❌ Error connecting to database:', err.message);
    } finally {
        await client.end();
    }
}

checkDb();
