require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function checkDb() {
    try {
        await client.connect();
        console.log('✅ Connected to database successfully.');

        // List all tables
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log('\n📊 Tables in database:');
        if (res.rows.length === 0) {
            console.log('   (No tables found)');
        } else {
            res.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        }

        // Count users
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        console.log(`\n👥 Total Users: ${userCount.rows[0].count}`);

    } catch (err) {
        console.error('❌ Error connecting to database:', err.message);
    } finally {
        await client.end();
    }
}

checkDb();
