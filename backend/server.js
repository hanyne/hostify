const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');

// Load .env file only if it exists (for local development)
const envPath = path.join(__dirname, '.env');
console.log('Looking for .env at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('.env file found at:', envPath);
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Content of .env file:', envContent);

  try {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      throw result.error;
    }
    console.log('Successfully loaded .env from:', envPath);
    console.log('Parsed .env variables:', result.parsed);
  } catch (error) {
    console.error('Failed to load .env:', error.message);
    process.exit(1);
  }
} else {
  console.log('.env file not found. Assuming environment variables are set (e.g., in Render).');
}

// Log environment variables for debugging
console.log('Environment Variables:', {
  DB_HOST: process.env.DB_HOST || 'NOT_SET',
  DB_PORT: process.env.DB_PORT || 'NOT_SET',
  DB_USER: process.env.DB_USER || 'NOT_SET',
  DB_PASSWORD: process.env.DB_PASSWORD ? '[REDACTED]' : 'NOT_SET',
  DB_NAME: process.env.DB_NAME || 'NOT_SET',
  NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
  PORT: process.env.PORT || 'NOT_SET',
  FRONTEND_URL: process.env.FRONTEND_URL || 'NOT_SET',
  BASE_DOMAIN: process.env.BASE_DOMAIN || 'NOT_SET',
});

// Check for required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'PORT', 'NODE_ENV', 'JWT_SECRET', 'BASE_DOMAIN', 'FRONTEND_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize database pool **after** environment variables are confirmed
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/sites', express.static(path.join(__dirname, 'public/sites'), { index: 'index.html' }));

app.use((req, res, next) => {
  const host = req.headers.host;
  console.log('Host detected:', host);
  const [domain, port] = host.split(':');
  const hostParts = domain.split('.');
  const baseDomain = process.env.BASE_DOMAIN || 'localhost';
  const baseDomainParts = baseDomain.split('.');
  if (hostParts.length > baseDomainParts.length) {
    const sub = hostParts[0];
    console.log('Subdomain detected:', sub);
    const domainName = sub;
    console.log('Domain name:', domainName);
    const sitePath = path.join(__dirname, 'public/sites', domainName);
    console.log('Site path:', sitePath);
    if (fs.existsSync(sitePath) && fs.existsSync(path.join(sitePath, 'index.html'))) {
      return express.static(sitePath, { index: 'index.html' })(req, res, next);
    } else {
      return res.status(404).json({ message: `Site not found for subdomain ${sub}` });
    }
  }
  next();
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

app.use('/api', authRoutes);

app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});