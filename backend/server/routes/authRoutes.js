const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const clientController = require('../controllers/clientController');
const domainReservationController = require('../controllers/domainReservationController');
const offerController = require('../controllers/offerController');

// Routes d'authentification
router.post('/api/inscription', authController.register);
router.post('/api/login', authController.login);
router.post('/api/forgot-password', authController.forgotPassword);
router.post('/api/reset-password', authController.resetPassword);
router.post('/api/contact', authController.contact);

// Routes pour les clients
router.get('/api/clients', clientController.getClients);
router.post('/api/clients', clientController.addClient);
router.put('/api/clients/:id', clientController.updateClient);
router.delete('/api/clients/:id', clientController.deleteClient);

// Routes pour les réservations
router.post('/api/reservations', domainReservationController.addReservation);
router.get('/api/reservations/user/:userId', domainReservationController.getUserReservations);
router.get('/api/reservations', domainReservationController.getAllReservations);
router.put('/api/reservations/:id', domainReservationController.updateReservation);
router.delete('/api/reservations/:id', domainReservationController.deleteReservation);
router.put('/api/reservations/:id/status', domainReservationController.updateReservationStatus);

// Routes pour les offres
router.get('/api/offers', offerController.getAllOffers);
router.get('/api/offers/:id', offerController.getOfferById);
router.post('/api/offers', offerController.addOffer);
router.put('/api/offers/:id', offerController.updateOffer);
router.delete('/api/offers/:id', offerController.deleteOffer);

// Routes pour les fichiers de projet
router.post('/api/project-files', domainReservationController.uploadProjectFiles);
router.get('/api/project-files/:reservationId', domainReservationController.getProjectFiles);
router.delete('/api/project-files/:id', domainReservationController.deleteProjectFile);

module.exports = router;