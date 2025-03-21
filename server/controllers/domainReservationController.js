// server/controllers/domainReservationController.js
const DomainReservation = require('../models/domainReservationModel');
const Offer = require('../models/offerModel');

const domainReservationController = {
  // Ajouter une réservation
  addReservation: async (req, res) => {
    const { userId, domainName, offerId, technologies, projectType, hostingNeeded, additionalServices, preferredContactMethod, projectDeadline, budgetRange } = req.body;
    try {
      // Vérifier si le domaine est disponible
      const isAvailable = await DomainReservation.checkDomainAvailability(domainName);
      if (!isAvailable) {
        return res.status(400).json({ message: 'Ce nom de domaine est déjà réservé.' });
      }

      // Vérifier si l'offre existe
      const offer = await Offer.findById(offerId);
      if (!offer) {
        return res.status(400).json({ message: 'Offre invalide.' });
      }

      const reservationId = await DomainReservation.create(
        userId,
        domainName,
        offerId,
        technologies,
        projectType,
        hostingNeeded,
        additionalServices,
        preferredContactMethod,
        projectDeadline,
        budgetRange
      );
      res.status(201).json({ message: 'Réservation ajoutée avec succès !', reservationId });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réservation:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // Consulter les réservations d'un utilisateur
  getUserReservations: async (req, res) => {
    const { userId } = req.params;
    try {
      const reservations = await DomainReservation.findByUserId(userId);
      res.status(200).json(reservations);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // Consulter toutes les réservations (pour l'admin)
  getAllReservations: async (req, res) => {
    try {
      const reservations = await DomainReservation.findAll();
      res.status(200).json(reservations);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // Modifier une réservation
  updateReservation: async (req, res) => {
    const { id } = req.params;
    const { domainName, offerId, technologies, projectType, hostingNeeded, additionalServices, preferredContactMethod, projectDeadline, budgetRange } = req.body;
    try {
      const reservation = await DomainReservation.findById(id);
      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée.' });
      }
      if (reservation.status !== 'pending') {
        return res.status(400).json({ message: 'Impossible de modifier une réservation déjà validée ou refusée.' });
      }

      // Vérifier si le nouveau nom de domaine est disponible
      if (domainName !== reservation.domain_name) {
        const isAvailable = await DomainReservation.checkDomainAvailability(domainName);
        if (!isAvailable) {
          return res.status(400).json({ message: 'Ce nom de domaine est déjà réservé.' });
        }
      }

      await DomainReservation.update(
        id,
        domainName,
        offerId,
        technologies,
        projectType,
        hostingNeeded,
        additionalServices,
        preferredContactMethod,
        projectDeadline,
        budgetRange
      );
      res.status(200).json({ message: 'Réservation mise à jour avec succès !' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // Supprimer une réservation
  deleteReservation: async (req, res) => {
    const { id } = req.params;
    try {
      const reservation = await DomainReservation.findById(id);
      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée.' });
      }
      if (reservation.status !== 'pending') {
        return res.status(400).json({ message: 'Impossible de supprimer une réservation déjà validée ou refusée.' });
      }

      await DomainReservation.delete(id);
      res.status(200).json({ message: 'Réservation supprimée avec succès !' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // Valider ou refuser une réservation (admin)
  updateReservationStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' ou 'rejected'
    try {
      const reservation = await DomainReservation.findById(id);
      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée.' });
      }
      if (reservation.status !== 'pending') {
        return res.status(400).json({ message: 'Cette réservation a déjà été traitée.' });
      }
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Statut invalide.' });
      }

      await DomainReservation.updateStatus(id, status);
      res.status(200).json({ message: `Réservation ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès !` });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la réservation:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // Récupérer les offres disponibles
  getOffers: async (req, res) => {
    try {
      const offers = await Offer.findAll();
      res.status(200).json(offers);
    } catch (error) {
      console.error('Erreur lors de la récupération des offres:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
};

module.exports = domainReservationController;