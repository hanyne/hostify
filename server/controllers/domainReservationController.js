// server/controllers/domainReservationController.js
const DomainReservation = require('../models/domainReservationModel');
const Offer = require('../models/offerModel');
const ProjectFile = require('../models/projectFileModel');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');

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

      // Si la réservation est acceptée, déclencher l'hébergement
      if (status === 'accepted') {
        const deployedUrl = await deployWebsite(reservation);
        if (deployedUrl) {
          await DomainReservation.updateDeployedUrl(id, deployedUrl);
          return res.status(200).json({ message: 'Réservation acceptée avec succès !', deployedUrl });
        } else {
          return res.status(200).json({ message: 'Réservation acceptée, mais aucun fichier à déployer pour l\'instant.' });
        }
      }

      res.status(200).json({ message: `Réservation ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès !` });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la réservation:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // Upload de fichiers
  uploadProjectFiles: async (req, res) => {
    const { reservationId } = req.body;
    console.log('Upload de fichiers pour la réservation:', reservationId);
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
      console.log('Dossier d\'upload:', uploadDir);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Dossier d\'upload créé:', uploadDir);
      }

      const uploadedFiles = [];
      const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
      console.log('Fichiers reçus:', files.map(f => f.name));

      // Validation de la taille des fichiers
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
      for (const file of files) {
        console.log(`Taille du fichier ${file.name}: ${file.size} octets`);
        if (file.size > MAX_FILE_SIZE) {
          return res.status(400).json({ message: `Le fichier ${file.name} dépasse la taille maximale de 10 MB.` });
        }
      }

      for (const file of files) {
        if (file.name.endsWith('.zip')) {
          // Si c'est un fichier ZIP, le décompresser
          const zipPath = path.join(uploadDir, file.name);
          console.log('Déplacement du fichier ZIP vers:', zipPath);
          await file.mv(zipPath); // Déplacer le fichier ZIP temporairement
          const zip = new AdmZip(zipPath);
          zip.extractAllTo(uploadDir, true); // Décompresser dans le dossier

          // Lister les fichiers extraits
          const extractedFiles = fs.readdirSync(uploadDir).filter((f) => f !== file.name);
          console.log('Fichiers extraits du ZIP:', extractedFiles);
          for (const extractedFile of extractedFiles) {
            const filePath = path.join(uploadDir, extractedFile);
            await ProjectFile.create(reservationId, filePath, extractedFile);
            uploadedFiles.push({ file_name: extractedFile, file_path: filePath });
          }

          // Supprimer le fichier ZIP après extraction
          fs.unlinkSync(zipPath);
          console.log('Fichier ZIP supprimé:', zipPath);
        } else {
          // Si c'est un fichier normal
          const filePath = path.join(uploadDir, file.name);
          console.log('Déplacement du fichier vers:', filePath);
          await file.mv(filePath);
          await ProjectFile.create(reservationId, filePath, file.name);
          uploadedFiles.push({ file_name: file.name, file_path: filePath });
        }
      }

      // Vérifier la présence d'un index.html
      console.log('Fichiers uploadés:', uploadedFiles.map(f => f.file_name));
      const hasIndexHtml = uploadedFiles.some(file => file.file_name.toLowerCase() === 'index.html');
      if (!hasIndexHtml) {
        // Supprimer les fichiers uploadés si index.html est manquant
        for (const file of uploadedFiles) {
          if (fs.existsSync(file.file_path)) {
            fs.unlinkSync(file.file_path);
          }
        }
        // Supprimer les entrées de la base de données
        for (const file of uploadedFiles) {
          await ProjectFile.deleteByReservationId(reservationId);
        }
        return res.status(400).json({ message: 'Un fichier index.html est requis pour déployer le site.' });
      }

      // Redéployer le site après l'upload des fichiers
      const deployedUrl = await deployWebsite(reservation);
      if (deployedUrl) {
        await DomainReservation.updateDeployedUrl(reservationId, deployedUrl);
      }

      res.status(200).json({ message: 'Fichiers uploadés avec succès !', files: uploadedFiles, deployedUrl });
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

  // Supprimer un fichier
  deleteProjectFile: async (req, res) => {
    const { id } = req.params;
    try {
      const file = await ProjectFile.findById(id);
      if (!file) {
        return res.status(404).json({ message: 'Fichier non trouvé.' });
      }

      const reservation = await DomainReservation.findById(file.reservation_id);
      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée.' });
      }

      // Supprimer le fichier du système de fichiers
      if (fs.existsSync(file.file_path)) {
        fs.unlinkSync(file.file_path);
        console.log('Fichier supprimé du disque:', file.file_path);
      } else {
        console.warn(`Fichier non trouvé sur le disque : ${file.file_path}`);
      }

      // Supprimer l'entrée de la base de données
      await ProjectFile.delete(id);
      console.log('Fichier supprimé de la base de données:', id);

      // Redéployer le site après la suppression du fichier
      const deployedUrl = await deployWebsite(reservation);
      if (deployedUrl) {
        await DomainReservation.updateDeployedUrl(reservation.id, deployedUrl);
      } else {
        // Si aucun fichier n'est déployé, réinitialiser l'URL déployée
        await DomainReservation.updateDeployedUrl(reservation.id, null);
      }

      res.status(200).json({ message: 'Fichier supprimé avec succès !', deployedUrl });
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
};


// server/controllers/domainReservationController.js
const deployWebsite = async (reservation) => {
  try {
    console.log(`Déploiement du site pour la réservation ${reservation.id}`);

    const files = await ProjectFile.findByReservationId(reservation.id);
    console.log('Fichiers trouvés:', files);
    if (!files || files.length === 0) {
      console.log(`Aucun fichier trouvé pour la réservation ${reservation.id}`);
      return null;
    }

    const publicDir = path.join(__dirname, '../public/sites', reservation.domain_name);
    console.log('Dossier public:', publicDir);
    if (fs.existsSync(publicDir)) {
      console.log('Suppression du dossier existant:', publicDir);
      fs.rmSync(publicDir, { recursive: true, force: true });
    }
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('Dossier créé:', publicDir);

    for (const file of files) {
      const sourcePath = file.file_path;
      const destPath = path.join(publicDir, file.file_name);
      console.log(`Copie de ${sourcePath} vers ${destPath}`);
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Fichier ${file.file_name} copié vers ${destPath}`);
      } else {
        console.log(`Fichier source ${sourcePath} non trouvé`);
      }
    }

    const indexPath = path.join(publicDir, 'index.html');
    console.log(`Vérification de la présence de index.html à : ${indexPath}`);
    const hasIndexHtml = fs.existsSync(indexPath);
    if (!hasIndexHtml) {
      console.log('Aucun fichier index.html trouvé dans le dossier public, annulation du déploiement.');
      fs.rmSync(publicDir, { recursive: true, force: true });
      return null;
    }

    const deployedFiles = fs.readdirSync(publicDir);
    console.log(`Fichiers dans le dossier public après déploiement : ${deployedFiles}`);

    // Générer une URL sous la forme d’un sous-domaine
    const baseDomain = process.env.BASE_DOMAIN || 'localhost:5000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const deployedUrl = `${protocol}://${reservation.domain_name.replace(/\./g, '-')}.${baseDomain}`;
    console.log(`Site déployé pour ${reservation.domain_name} à l'URL ${deployedUrl}`);
    return deployedUrl;
  } catch (error) {
    console.error('Erreur lors du déploiement du site:', error.message);
    return null;
  }
};
module.exports = domainReservationController;