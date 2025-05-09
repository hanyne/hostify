const mysql = require('mysql2/promise');

console.log('Database Connection Config:');
console.log({
  host: process.env.DB_HOST || 'NOT_SET',
  port: process.env.DB_PORT || 'NOT_SET',
  user: process.env.DB_USER || 'NOT_SET',
  password: process.env.DB_PASSWORD ? '[REDACTED]' : 'NOT_SET',
  database: process.env.DB_NAME || 'NOT_SET',
});

const dbPort = parseInt(process.env.DB_PORT, 10);
if (isNaN(dbPort)) {
  console.error('DB_PORT is not a valid number:', process.env.DB_PORT);
  process.exit(1);
}

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
  debug: process.env.NODE_ENV === 'production' ? false : true, // Disable debug in production
});

// Test pool connection
async function testPoolConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database pool connection successful! Connection details:', connection.config);
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', rows);
    connection.release();
  } catch (error) {
    console.error('Database pool connection error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage || 'N/A',
      stack: error.stack,
    });
    process.exit(1);
  }
}
testPoolConnection();

module.exports = pool;