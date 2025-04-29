// server/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Database Connection Config:');
console.log({
  host: process.env.DB_HOST || 'NOT_SET',
  port: process.env.DB_PORT || 'NOT_SET',
  user: process.env.DB_USER || 'NOT_SET',
  password: process.env.DB_PASSWORD ? '[REDACTED]' : 'NOT_SET',
  database: process.env.DB_NAME || 'NOT_SET',
});

const dbPort = parseInt(process.env.DB_PORT, 10) || 35640;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
});

// Test pool connection on startup
async function testPoolConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database pool connection successful!');
    connection.release();
  } catch (error) {
    console.error('Database pool connection error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage || 'N/A',
    });
  }
}
testPoolConnection();

module.exports = pool;