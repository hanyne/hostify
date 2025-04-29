const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const clientController = require('../controllers/clientController');
const domainReservationController = require('../controllers/domainReservationController');
const offerController = require('../controllers/offerController');

// Routes d'authentification
router.post('/api/inscription', authController.register);
// server/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Database Connection Config:');
console.log({
  host: process.env.DB_HOST || 'NOT_SET',
  port: process.env.DB_PORT || 'NOT_SET',
  user: process.env.DB_USER || 'NOT_SET',
  password: process.env.DB_PASSWORD ? '[REDACTED]' : 'NOT_SET',
  database: process.env.DB_NAME || 'NOT_SET',
});

const dbPort = parseInt(process.env.DB_PORT, 10) || 35640;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
});

// Test pool connection on startup
async function testPoolConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database pool connection successful!');
    connection.release();
  } catch (error) {
    console.error('Database pool connection error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage || 'N/A',
    });
  }
}
testPoolConnection();

module.exports = pool;
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