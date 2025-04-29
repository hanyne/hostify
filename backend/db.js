// server/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Database Connection Config:');
console.log({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '[REDACTED]' : 'NOT_SET',
  database: process.env.DB_NAME,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000, // 30 seconds
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