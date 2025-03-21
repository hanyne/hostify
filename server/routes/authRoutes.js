// server/routes/index.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const clientController = require('../controllers/clientController');
const domainReservationController = require('../controllers/domainReservationController');

router.post('/api/inscription', authController.register);
router.post('/api/login', authController.login);
router.post('/api/forgot-password', authController.forgotPassword);
router.post('/api/reset-password', authController.resetPassword);
router.post('/api/contact', authController.contact);

// Add /api prefix to client routes for consistency
router.get('/api/clients', clientController.getClients);
router.post('/api/clients', clientController.addClient);
router.put('/api/clients/:id', clientController.updateClient);
router.delete('/api/clients/:id', clientController.deleteClient);


// Routes pour les réservations
router.post('/api/reservations', domainReservationController.addReservation); // Ajouter une réservation
router.get('/api/reservations/user/:userId', domainReservationController.getUserReservations); // Réservations d'un utilisateur
router.get('/api/reservations', domainReservationController.getAllReservations); // Toutes les réservations (admin)
router.put('/api/reservations/:id', domainReservationController.updateReservation); // Modifier une réservation
router.delete('/api/reservations/:id', domainReservationController.deleteReservation); // Supprimer une réservation
router.put('/api/reservations/:id/status', domainReservationController.updateReservationStatus); // Valider/refuser une réservation
router.get('/api/offers', domainReservationController.getOffers); // Récupérer les offres
module.exports = router;