// backend/routes/domainRoutes.js
const express = require('express');
const router = express.Router();
const domainReservationController = require('../controllers/domainReservationController');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

// Twilio Configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Middleware to authenticate admin
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  console.log('Token reçu:', token); // Log pour débogage
  if (!token) {
    console.log('Aucun token fourni');
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decoded); // Log pour débogage
    if (decoded.role !== 'admin') {
      console.log('Rôle non admin:', decoded.role);
      return res.status(403).json({ error: 'Accès interdit: réservé aux administrateurs' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error.message);
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Get all reservations
router.get('/reservations', authenticateAdmin, domainReservationController.getAllReservations);

// Get offers
router.get('/offers', domainReservationController.getOffers);

// Update payment status
router.put('/reservations/:id/payment', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;
  console.log(`Mise à jour du statut de paiement pour la réservation ${id}: ${payment_status}`);
  try {
    const reservation = await domainReservationController.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée.' });
    }
    if (!['unpaid', 'paid'].includes(payment_status)) {
      return res.status(400).json({ message: 'Statut de paiement invalide.' });
    }

    await domainReservationController.updatePaymentStatus(id, payment_status);
    const updatedReservation = await domainReservationController.findById(id);
    if (payment_status === 'paid') {
      const hostingLink = `${process.env.BASE_DOMAIN}/${reservation.domain_name}`;
      await twilioClient.messages.create({
        body: `Paiement effectué avec succès ! Consultez votre solution d'hébergement ici : ${hostingLink}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: reservation.client_phone || reservation.phone,
      });
      res.status(200).json({ message: 'Statut de paiement mis à jour et notification envoyée !', reservation: updatedReservation });
    } else {
      res.status(200).json({ message: 'Statut de paiement mis à jour !', reservation: updatedReservation });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de paiement:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de paiement.' });
  }
});
module.exports = router;