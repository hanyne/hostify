// server/controllers/domainReservationController.js
const DomainReservation = require('../models/domainReservationModel');
const Offer = require('../models/offerModel');
const ProjectFile = require('../models/projectFileModel');
const path = require('path');
const fs = require('fs');

const domainReservationController = {
  // Ajouter une réservation
  addReservation: async (req, res) => {
    const { userId, domainName, offerId, hostingOfferId, technologies, projectType, hostingNeeded, additionalServices, preferredContactMethod, projectDeadline, budgetRange } = req.body;
    try {
      // Vérifier si le domaine est disponible
      const isAvailable = await DomainReservation.checkDomainAvailability(domainName);
      if (!isAvailable) {
        return res.status(400).json({ message: 'Ce nom de domaine est déjà réservé.' });
      }

      // Vérifier si l'offre de domaine existe et est de type 'domain'
      const offer = await Offer.findById(offerId);
      if (!offer || offer.offer_type !== 'domain') {
        return res.status(400).json({ message: 'Offre de domaine invalide.' });
      }

      // Vérifier si l'offre d'hébergement existe et est de type 'hosting' (si fournie)
      if (hostingOfferId) {
        const hostingOffer = await Offer.findById(hostingOfferId);
        if (!hostingOffer || hostingOffer.offer_type !== 'hosting') {
          return res.status(400).json({ message: 'Offre d\'hébergement invalide.' });
        }
      }

      const reservationId = await DomainReservation.create(
        userId,
        domainName,
        offerId,
        hostingOfferId,
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
    const { domainName, offerId, hostingOfferId, technologies, projectType, hostingNeeded, additionalServices, preferredContactMethod, projectDeadline, budgetRange } = req.body;
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

      // Vérifier si l'offre d'hébergement existe et est de type 'hosting' (si fournie)
      if (hostingOfferId) {
        const hostingOffer = await Offer.findById(hostingOfferId);
        if (!hostingOffer || hostingOffer.offer_type !== 'hosting') {
          return res.status(400).json({ message: 'Offre d\'hébergement invalide.' });
        }
      }

      await DomainReservation.update(
        id,
        domainName,
        offerId,
        hostingOfferId,
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
// Récupérer les offres de domaine
getOffers: async (req, res) => {
  const { type } = req.query; // Ajout du paramètre type pour filtrer
  try {
    const offers = await Offer.findAll(type);
    res.status(200).json(offers);
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error.message);
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
    const { status } = req.body;
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

  // Upload de fichiers
  uploadProjectFiles: async (req, res) => {
    const { reservationId } = req.body;
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'Aucun fichier uploadé.' });
    }

    try {
      const reservation = await DomainReservation.findById(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée.' });
      }
      if (reservation.status !== 'accepted') {
        return res.status(400).json({ message: 'La réservation doit être acceptée pour uploader des fichiers.' });
      }

      const uploadDir = path.join(__dirname, '../uploads', reservationId.toString());
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uploadedFiles = [];
      const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];

      for (const file of files) {
        if (file.name.endsWith('.zip')) {
          // Si c'est un fichier ZIP, le décompresser
          const zipPath = path.join(uploadDir, file.name);
          await file.mv(zipPath); // Déplacer le fichier ZIP temporairement
          const zip = new AdmZip(zipPath);
          zip.extractAllTo(uploadDir, true); // Décompresser dans le dossier

          // Lister les fichiers extraits
          const extractedFiles = fs.readdirSync(uploadDir).filter((f) => f !== file.name);
          for (const extractedFile of extractedFiles) {
            const filePath = path.join(uploadDir, extractedFile);
            await ProjectFile.create(reservationId, filePath, extractedFile);
            uploadedFiles.push({ file_name: extractedFile, file_path: filePath });
          }

          // Supprimer le fichier ZIP après extraction
          fs.unlinkSync(zipPath);
        } else {
          // Si c'est un fichier normal
          const filePath = path.join(uploadDir, file.name);
          await file.mv(filePath);
          await ProjectFile.create(reservationId, filePath, file.name);
          uploadedFiles.push({ file_name: file.name, file_path: filePath });
        }
      }

      res.status(200).json({ message: 'Fichiers uploadés avec succès !', files: uploadedFiles });
    } catch (error) {
      console.error('Erreur lors de l\'upload des fichiers:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // Récupérer les fichiers d'une réservation
  getProjectFiles: async (req, res) => {
    const { reservationId } = req.params;
    try {
      const files = await ProjectFile.findByReservationId(reservationId);
      res.status(200).json(files);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // server/controllers/domainReservationController.js
deleteProjectFile: async (req, res) => {
  const { id } = req.params;
  try {
    const [files] = await pool.query('SELECT file_path FROM project_files WHERE id = ?', [id]);
    if (files.length === 0) {
      return res.status(404).json({ message: 'Fichier non trouvé.' });
    }

    const filePath = files[0].file_path;
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Supprimer le fichier du système de fichiers
      } else {
        console.warn(`Fichier non trouvé sur le disque : ${filePath}`);
      }
    } catch (fileError) {
      console.error('Erreur lors de la suppression du fichier sur le disque:', fileError.message);
      // Continuer même si le fichier n'a pas pu être supprimé du disque
    }

    await pool.query('DELETE FROM project_files WHERE id = ?', [id]); // Supprimer l'entrée de la base de données
    res.status(200).json({ message: 'Fichier supprimé avec succès !' });
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
},
};



module.exports = domainReservationController;