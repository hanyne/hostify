const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  ssl: { rejectUnauthorized: true },
  debug: process.env.NODE_ENV === 'development',
});

async function testPoolConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful!');
    connection.release();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}
testPoolConnection();

module.exports = pool;