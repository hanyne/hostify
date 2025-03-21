// server/server.js
const express = require('express');
const cors = require('cors');
const router = require('./routes/authRoutes'); // Corriger le chemin vers index.js
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - utiliser directement le router sans préfixe supplémentaire
app.use(router); // Au lieu de app.use('/', router)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});