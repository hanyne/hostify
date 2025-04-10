// server/server.js
const express = require('express');
const cors = require('cors');
const router = require('./routes/authRoutes'); // Corriger le chemin vers index.js
require('dotenv').config();
const path = require('path'); // Ajout pour gérer les chemins
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis le dossier public pour l'hébergement
app.use('/sites', express.static(path.join(__dirname, 'public/sites'), { index: 'index.html' })); // Ajout
app.use((req, res, next) => {
  const host = req.headers.host; // Par exemple, "mon-autre-site-fr.localhost:5000"
  console.log('Host détecté:', host); // Log pour déboguer
  // Séparer le domaine et le port
  const [domain, port] = host.split(':'); // Par exemple, ["mon-autre-site-fr.localhost", "5000"]
  const hostParts = domain.split('.'); // Séparer les parties du domaine, par exemple ["mon-autre-site-fr", "localhost"]
  if (hostParts.length >= 2 && hostParts[hostParts.length - 1] === 'localhost') { // Vérifier si c'est un sous-domaine de localhost
    const sub = hostParts[0]; // Par exemple, "mon-autre-site-fr"
    console.log('Sous-domaine détecté:', sub); // Log pour déboguer
    const domainName = sub; // Ne pas convertir les tirets en points, garder "mon-autre-site.fr"
    console.log('Nom de domaine:', domainName); // Log pour déboguer
    const sitePath = path.join(__dirname, 'public/sites', domainName);
    console.log('Chemin du site:', sitePath); // Log pour déboguer
    if (fs.existsSync(sitePath) && fs.existsSync(path.join(sitePath, 'index.html'))) {
      return express.static(sitePath, { index: 'index.html' })(req, res, next);
    } else {
      return res.status(404).json({ message: `Site non trouvé pour le sous-domaine ${sub}` });
    }
  }
  next();
});

// Routes - utiliser directement le router sans préfixe supplémentaire
app.use(router); // Au lieu de app.use('/', router)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});