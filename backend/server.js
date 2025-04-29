// server.js
const express = require('express');
const cors = require('cors');
const router = require('./routes/authRoutes');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');

// Load environment variables
const envFile = process.env.IS_RENDER ? '.env' : '.env.local';
try {
  const result = dotenv.config({ path: envFile });
  if (result.error) {
    console.error(`Failed to load ${envFile}:`, result.error.message);
  } else {
    console.log(`Successfully loaded ${envFile}`);
  }
} catch (error) {
  console.error(`Error loading ${envFile}:`, error.message);
}

// Force NODE_ENV=production for Render
if (process.env.IS_RENDER) {
  process.env.NODE_ENV = 'production';
}

console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('IS_RENDER:', process.env.IS_RENDER || 'not set');
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT || 'not set');
console.log('DB_HOST:', process.env.DB_HOST || 'not set');
console.log('DB_PORT:', process.env.DB_PORT || 'not set');
console.log('DB_USER:', process.env.DB_USER || 'not set');
console.log('DB_NAME:', process.env.DB_NAME || 'not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');

const app = express();
const PORT = process.env.PORT || 5000; // Fallback to 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Serve static files for hosting
app.use('/sites', express.static(path.join(__dirname, 'public/sites'), { index: 'index.html' }));

app.use((req, res, next) => {
  const host = req.headers.host;
  console.log('Host détecté:', host);
  const [domain, port] = host.split(':');
  const hostParts = domain.split('.');
  const baseDomain = process.env.BASE_DOMAIN || 'localhost';
  const baseDomainParts = baseDomain.split('.');
  if (hostParts.length > baseDomainParts.length) {
    const sub = hostParts[0];
    console.log('Sous-domaine détecté:', sub);
    const domainName = sub;
    console.log('Nom de domaine:', domainName);
    const sitePath = path.join(__dirname, 'public/sites', domainName);
    console.log('Chemin du site:', sitePath);
    if (fs.existsSync(sitePath) && fs.existsSync(path.join(sitePath, 'index.html'))) {
      return express.static(sitePath, { index: 'index.html' })(req, res, next);
    } else {
      return res.status(404).json({ message: `Site non trouvé pour le sous-domaine ${sub}` });
    }
  }
  next();
});

// Serve the frontend (React build) in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Routes
app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

// Test database connection on startup
const pool = require('./db');
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful!');
    connection.release();
  } catch (error) {
    console.error('Database connection error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage || 'N/A',
    });
  }
}
testDatabaseConnection();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Listening explicitly on port ${PORT} to avoid auto-detection issues`);
});