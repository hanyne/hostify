// server/routes/index.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const clientController = require('../controllers/clientController');
const domainReservationController = require('../controllers/domainReservationController');
const offerController = require('../controllers/offerController');
const fileUpload = require('express-fileupload');

// Routes d'authentification
router.post('/api/inscription', authController.register);
router.post('/api/login', authController.login);
router.post('/api/forgot-password', authController.forgotPassword);
router.post('/api/reset-password', authController.resetPassword);
router.post('/api/contact', authController.contact);

// Middleware pour l'upload de fichiers
router.use(fileUpload());

// Routes pour les clients
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

// Routes pour les offres
router.get('/api/offers', offerController.getAllOffers); // Récupérer toutes les offres
router.get('/api/offers/:id', offerController.getOfferById); // Récupérer une offre par ID
router.post('/api/offers', offerController.addOffer); // Ajouter une offre
router.put('/api/offers/:id', offerController.updateOffer); // Mettre à jour une offre
router.delete('/api/offers/:id', offerController.deleteOffer); // Supprimer une offre

// Routes pour les fichiers de projet
router.post('/api/project-files', domainReservationController.uploadProjectFiles);
router.get('/api/project-files/:reservationId', domainReservationController.getProjectFiles);
router.delete('/api/project-files/:id', domainReservationController.deleteProjectFile);

module.exports = router;