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
    console.log('process.env after dotenv:', {
      DB_HOST: process.env.DB_HOST || 'NOT_SET',
      DB_PORT: process.env.DB_PORT || 'NOT_SET',
      DB_USER: process.env.DB_USER || 'NOT_SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? '[REDACTED]' : 'NOT_SET',
      DB_NAME: process.env.DB_NAME || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      PORT: process.env.PORT || 'NOT_SET',
      FRONTEND_URL: process.env.FRONTEND_URL || 'NOT_SET',
      BASE_DOMAIN: process.env.BASE_DOMAIN || 'NOT_SET',
      JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : 'NOT_SET', // Redact JWT_SECRET
      EMAIL_HOST: process.env.EMAIL_HOST || 'NOT_SET',
      EMAIL_PORT: process.env.EMAIL_PORT || 'NOT_SET',
      EMAIL_USER: process.env.EMAIL_USER || 'NOT_SET',
      EMAIL_PASS: process.env.EMAIL_PASS ? '[REDACTED]' : 'NOT_SET',
    });
  } catch (error) {
    console.error('Failed to load .env:', error.message);
    process.exit(1);
  }
} else {
  console.log('.env file not found. Assuming environment variables are set (e.g., in Render).');
  console.log('Current process.env:', {
    DB_HOST: process.env.DB_HOST || 'NOT_SET',
    DB_PORT: process.env.DB_PORT || 'NOT_SET',
    DB_USER: process.env.DB_USER || 'NOT_SET',
    DB_PASSWORD: process.env.DB_PASSWORD ? '[REDACTED]' : 'NOT_SET',
    DB_NAME: process.env.DB_NAME || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    PORT: process.env.PORT || 'NOT_SET',
    FRONTEND_URL: process.env.FRONTEND_URL || 'NOT_SET',
    BASE_DOMAIN: process.env.BASE_DOMAIN || 'NOT_SET',
    JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : 'NOT_SET', // Redact JWT_SECRET
    EMAIL_HOST: process.env.EMAIL_HOST || 'NOT_SET',
    EMAIL_PORT: process.env.EMAIL_PORT || 'NOT_SET',
    EMAIL_USER: process.env.EMAIL_USER || 'NOT_SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? '[REDACTED]' : 'NOT_SET',
  });
}

// Check for required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'BASE_DOMAIN',
  'FRONTEND_URL',
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize database pool
console.log('Requiring db.js now...');
const pool = require('./db'); // Now imports the pool directly

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
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
  console.log('Serving frontend build in production mode...');
  const frontendPath = path.join(__dirname, '../frontend/build');
  console.log('Frontend path:', frontendPath);
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
      console.log('Serving index.html for:', req.url);
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.error('Frontend build folder not found at:', frontendPath);
    process.exit(1);
  }
}

app.use('/api', authRoutes);

app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
  });
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});