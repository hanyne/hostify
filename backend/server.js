const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const domainRoutes = require('./routes/domainRoutes');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
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

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/sites', express.static(path.join('/app/Uploads/sites'), { index: 'index.html' }));

app.use((req, res, next) => {
  const host = req.headers.host;
  console.log('Host detected:', host);
  const baseDomain = process.env.BASE_DOMAIN || 'localhost';
  if (host !== baseDomain && !host.includes(`:${PORT}`)) {
    const domainName = host.split(`.${baseDomain}`)[0];
    const sitePath = path.join('/app/Uploads/sites', domainName);
    if (fs.existsSync(sitePath) && fs.existsSync(path.join(sitePath, 'index.html'))) {
      return express.static(sitePath, { index: 'index.html' })(req, res, next);
    } else {
      return res.status(404).json({ message: `Site not found for ${host}` });
    }
  }
  next();
});

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../build');
  if (!fs.existsSync(buildPath)) {
    console.error('Build directory not found at:', buildPath);
    process.exit(1);
  }
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.use('/api', authRoutes);
app.use('/api', domainRoutes);

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server listen error:', err.message);
  process.exit(1);
});