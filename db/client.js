const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'journal_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection on startup
pool.getConnection().then(conn => {
  conn.ping()
    .then(() => {
      console.log('Database connected successfully');
      conn.release();
    })
    .catch(err => {
      console.error('Database connection error:', err.message);
      conn.release();
    });
}).catch(err => {
  console.error('Database pool error:', err.message);
});

module.exports = {
  query: async (sql, params = []) => {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(sql, params);
      return { rows, rowCount: rows.length };
    } finally {
      conn.release();
    }
  },
  pool,
  getConnection: () => pool.getConnection()
};
