const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add SSL for production environments (e.g. Heroku, Vercel, Neon)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully at ' + res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  // Helper to get a client from the pool (for transactions)
  getClient: () => pool.connect()
};
