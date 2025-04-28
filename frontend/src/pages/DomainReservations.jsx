// client/src/DomainReservations.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaFileAlt, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DomainReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [domainOffers, setDomainOffers] = useState([]);
  const [hostingOffers, setHostingOffers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [error, setError] = useState(null);
  const [userId] = useState(1); // Remplacez par l'ID de l'utilisateur connecté (à récupérer via auth)
  const [projectFiles, setProjectFiles] = useState({}); // Stocker les fichiers par réservation
  const [showUploadForm, setShowUploadForm] = useState(null); // ID de la réservation pour laquelle uploader des fichiers

  // Récupérer les réservations de l'utilisateur
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/reservations/user/${userId}`);
        setReservations(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error.response ? error.response.data : error.message);
        setError('Erreur lors du chargement des réservations.');
      }
    };
    fetchReservations();
  }, [userId]);

  // Récupérer les offres de domaine et d'hébergement
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const domainResponse = await axios.get('http://localhost:5000/api/offers?type=domain');
        setDomainOffers(domainResponse.data);
        const hostingResponse = await axios.get('http://localhost:5000/api/offers?type=hosting');
        setHostingOffers(hostingResponse.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des offres:', error.response ? error.response.data : error.message);
        setError('Erreur lors du chargement des offres: ' + (error.response?.data?.message || error.message));
      }
    };
    fetchOffers();
  }, []);

  // Récupérer les fichiers pour une réservation spécifique
  const fetchProjectFiles = async (reservationId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/project-files/${reservationId}`);
      setProjectFiles((prev) => ({ ...prev, [reservationId]: response.data }));
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error.response ? error.response.data : error.message);
      setError('Erreur lors du chargement des fichiers.');
    }
  };

  // Ajouter une réservation
  const handleAddReservation = async (e) => {
    e.preventDefault();
    const formData = {
      userId,
      domainName: e.target.domainName.value,
      offerId: parseInt(e.target.offerId.value),
      hostingOfferId: e.target.hostingOfferId.value ? parseInt(e.target.hostingOfferId.value) : null,
      technologies: e.target.technologies.value,
      projectType: e.target.projectType.value,
      hostingNeeded: e.target.hostingNeeded.checked ? 1 : 0,
      additionalServices: e.target.additionalServices.value,
      preferredContactMethod: e.target.preferredContactMethod.value,
      projectDeadline: e.target.projectDeadline.value,
      budgetRange: e.target.budgetRange.value,
    };
    try {
      await axios.post('http://localhost:5000/api/reservations', formData);
      setShowAddForm(false);
      const response = await axios.get(`http://localhost:5000/api/reservations/user/${userId}`);
      setReservations(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réservation:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout de la réservation.');
    }
  };

  // Modifier une réservation
  const handleEditReservation = async (e) => {
    e.preventDefault();
    if (!selectedReservation || !selectedReservation.id) {
      setError('Aucune réservation sélectionnée pour la modification.');
      return;
    }
    const formData = {
      domainName: e.target.domainName.value,
      offerId: parseInt(e.target.offerId.value),
      hostingOfferId: e.target.hostingOfferId.value ? parseInt(e.target.hostingOfferId.value) : null,
      technologies: e.target.technologies.value,
      projectType: e.target.projectType.value,
      hostingNeeded: e.target.hostingNeeded.checked ? 1 : 0,
      additionalServices: e.target.additionalServices.value,
      preferredContactMethod: e.target.preferredContactMethod.value,
      projectDeadline: e.target.projectDeadline.value,
      budgetRange: e.target.budgetRange.value,
    };
    try {
      await axios.put(`http://localhost:5000/api/reservations/${selectedReservation.id}`, formData);
      setShowEditForm(false);
      setSelectedReservation(null);
      const response = await axios.get(`http://localhost:5000/api/reservations/user/${userId}`);
      setReservations(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la modification de la réservation:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Erreur lors de la modification de la réservation.');
    }
  };

  // Supprimer une réservation
  const handleDeleteReservation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reservations/${id}`);
        const response = await axios.get(`http://localhost:5000/api/reservations/user/${userId}`);
        setReservations(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la suppression de la réservation:', error.response ? error.response.data : error.message);
        setError(error.response?.data?.message || 'Erreur lors de la suppression de la réservation.');
      }
    }
  };

  // Uploader des fichiers pour une réservation
  const handleUploadFiles = async (e, reservationId) => {
    e.preventDefault();
    const files = e.target.files.files;
    if (!files || files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier.');
      return;
    }

    const formData = new FormData();
    formData.append('reservationId', reservationId);
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await axios.post('http://localhost:5000/api/project-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadForm(null);
      fetchProjectFiles(reservationId); // Rafraîchir la liste des fichiers
      const response = await axios.get(`http://localhost:5000/api/reservations/user/${userId}`);
      setReservations(response.data); // Rafraîchir la liste des réservations pour afficher la nouvelle URL déployée
      setError(null);
    } catch (error) {
      console.error('Erreur lors de l\'upload des fichiers:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Erreur lors de l\'upload des fichiers.');
    }
  };

  // Supprimer un fichier
  const handleDeleteFile = async (fileId, reservationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        console.log('Suppression du fichier avec ID:', fileId); // Log pour déboguer
        await axios.delete(`http://localhost:5000/api/project-files/${fileId}`);
        console.log('Fichier supprimé avec succès');
        fetchProjectFiles(reservationId); // Rafraîchir la liste des fichiers
        const response = await axios.get(`http://localhost:5000/api/reservations/user/${userId}`);
        setReservations(response.data); // Rafraîchir la liste des réservations pour afficher la nouvelle URL déployée
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error.response ? error.response.data : error.message);
        setError(error.response?.data?.message || 'Erreur lors de la suppression du fichier.');
      }
    }
  };

  return (
    <div className="reservations-page">
      <header className="page-header">
        <h1>Gestion des Réservations de Domaine</h1>
        <Link to="/dashboard" className="back-to-dashboard">
          Retour au Dashboard
        </Link>
      </header>

      {error && <div className="error-message">{error}</div>}
      <div className="reservations-section">
        <h2>Liste des Réservations</h2>
        <button className="add-reservation-btn" onClick={() => setShowAddForm(true)}>
          <FaPlus /> Ajouter une réservation
        </button>
        <div className="reservation-list">
          {reservations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Nom de Domaine</th>
                  <th>Offre de Domaine</th>
                  <th>Offre d'Hébergement</th>
                  <th>Technologies</th>
                  <th>Type de Projet</th>
                  <th>Statut</th>
                  <th>URL Déployée</th>
                  <th>Actions</th>
                  <th>Fichiers</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.domain_name}</td>
                    <td>{reservation.offer_name}</td>
                    <td>{reservation.hosting_offer_name || 'N/A'}</td>
                    <td>{reservation.technologies}</td>
                    <td>{reservation.project_type}</td>
                    <td>{reservation.status}</td>
                    <td>
                      {reservation.deployed_url ? (
                        <a href={reservation.deployed_url} target="_blank" rel="noopener noreferrer">
                          <FaEye /> Voir le site
                        </a>
                      ) : (
                        'Non déployé'
                      )}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowEditForm(true);
                        }}
                        disabled={reservation.status !== 'pending'}
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteReservation(reservation.id)}
                        disabled={reservation.status !== 'pending'}
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </td>
                    <td>
                      {reservation.status === 'accepted' && (
                        <>
                          <button
                            className="upload-btn"
                            onClick={() => {
                              setShowUploadForm(reservation.id);
                              fetchProjectFiles(reservation.id); // Charger les fichiers existants
                            }}
                          >
                            <FaUpload /> Uploader des fichiers
                          </button>
                          {projectFiles[reservation.id]?.length > 0 && (
                            <div className="file-list">
                              <h4>Fichiers uploadés :</h4>
                              <ul>
                                {projectFiles[reservation.id].map((file) => (
                                  <li key={file.id}>
                                    {file.file_name}{' '}
                                    <button
                                      className="delete-file-btn"
                                      onClick={() => handleDeleteFile(file.id, reservation.id)}
                                    >
                                      <FaTrash /> Supprimer
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucune réservation trouvée.</p>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="add-reservation-form">
          <h2>Ajouter une réservation</h2>
          <form onSubmit={handleAddReservation}>
            <div className="form-group">
              <label>Nom de Domaine :</label>
              <input type="text" name="domainName" required />
            </div>
            <div className="form-group">
              <label>Offre de Domaine :</label>
              <select name="offerId" required>
                <option value="">Sélectionner une offre</option>
                {domainOffers.length > 0 ? (
                  domainOffers.map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {offer.name} ({offer.price}€ pour {offer.duration_months} mois)
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Aucune offre de domaine disponible</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Offre d'Hébergement (optionnel) :</label>
              <select name="hostingOfferId">
                <option value="">Aucune</option>
                {hostingOffers.length > 0 ? (
                  hostingOffers.map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {offer.name} ({offer.price}€ pour {offer.duration_months} mois)
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Aucune offre d'hébergement disponible</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Technologies (séparées par des virgules) :</label>
              <input type="text" name="technologies" required placeholder="HTML, CSS, React" />
            </div>
            <div className="form-group">
              <label>Type de Projet :</label>
              <select name="projectType" required>
                <option value="portfolio">Portfolio</option>
                <option value="ecommerce">E-commerce</option>
                <option value="blog">Blog</option>
                <option value="business">Business</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>Besoin d'Hébergement :</label>
              <input type="checkbox" name="hostingNeeded" />
            </div>
            <div className="form-group">
              <label>Services Additionnels (optionnel) :</label>
              <input type="text" name="additionalServices" placeholder="SEO, Maintenance" />
            </div>
            <div className="form-group">
              <label>Méthode de Contact Préférée :</label>
              <select name="preferredContactMethod">
                <option value="email">Email</option>
                <option value="phone">Téléphone</option>
                <option value="both">Les deux</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date Limite du Projet (optionnel) :</label>
              <input type="date" name="projectDeadline" />
            </div>
            <div className="form-group">
              <label>Plage de Budget :</label>
              <select name="budgetRange">
                <option value="0-100">0-100€</option>
                <option value="100-500">100-500€</option>
                <option value="500-1000">500-1000€</option>
                <option value="1000+">1000€ et plus</option>
              </select>
            </div>
            <button type="submit">Ajouter</button>
            <button type="button" onClick={() => setShowAddForm(false)}>Annuler</button>
          </form>
        </div>
      )}

      {/* Formulaire de modification */}
      {showEditForm && selectedReservation && (
        <div className="add-reservation-form">
          <h2>Modifier la réservation</h2>
          <form onSubmit={handleEditReservation}>
            <div className="form-group">
              <label>Nom de Domaine :</label>
              <input type="text" name="domainName" defaultValue={selectedReservation.domain_name} required />
            </div>
            <div className="form-group">
              <label>Offre de Domaine :</label>
              <select name="offerId" defaultValue={selectedReservation.offer_id} required>
                <option value="">Sélectionner une offre</option>
                {domainOffers.length > 0 ? (
                  domainOffers.map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {offer.name} ({offer.price}€ pour {offer.duration_months} mois)
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Aucune offre de domaine disponible</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Offre d'Hébergement (optionnel) :</label>
              <select name="hostingOfferId" defaultValue={selectedReservation.hosting_offer_id || ''}>
                <option value="">Aucune</option>
                {hostingOffers.length > 0 ? (
                  hostingOffers.map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {offer.name} ({offer.price}€ pour {offer.duration_months} mois)
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Aucune offre d'hébergement disponible</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Technologies (séparées par des virgules) :</label>
              <input type="text" name="technologies" defaultValue={selectedReservation.technologies} required />
            </div>
            <div className="form-group">
              <label>Type de Projet :</label>
              <select name="projectType" defaultValue={selectedReservation.project_type} required>
                <option value="portfolio">Portfolio</option>
                <option value="ecommerce">E-commerce</option>
                <option value="blog">Blog</option>
                <option value="business">Business</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>Besoin d'Hébergement :</label>
              <input type="checkbox" name="hostingNeeded" defaultChecked={selectedReservation.hosting_needed} />
            </div>
            <div className="form-group">
              <label>Services Additionnels (optionnel) :</label>
              <input type="text" name="additionalServices" defaultValue={selectedReservation.additional_services} />
            </div>
            <div className="form-group">
              <label>Méthode de Contact Préférée :</label>
              <select name="preferredContactMethod" defaultValue={selectedReservation.preferred_contact_method}>
                <option value="email">Email</option>
                <option value="phone">Téléphone</option>
                <option value="both">Les deux</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date Limite du Projet (optionnel) :</label>
              <input type="date" name="projectDeadline" defaultValue={selectedReservation.project_deadline} />
            </div>
            <div className="form-group">
              <label>Plage de Budget :</label>
              <select name="budgetRange" defaultValue={selectedReservation.budget_range}>
                <option value="0-100">0-100€</option>
                <option value="100-500">100-500€</option>
                <option value="500-1000">500-1000€</option>
                <option value="1000+">1000€ et plus</option>
              </select>
            </div>
            <button type="submit">Modifier</button>
            <button type="button" onClick={() => setShowEditForm(false)}>Annuler</button>
          </form>
        </div>
      )}

      {/* Formulaire d'upload de fichiers */}
      {showUploadForm && (
        <div className="upload-files-form">
          <h2>Uploader des fichiers pour la réservation #{showUploadForm}</h2>
          <form onSubmit={(e) => handleUploadFiles(e, showUploadForm)}>
            <div className="form-group">
              <label>Sélectionner des fichiers :</label>
              <input type="file" name="files" multiple required />
            </div>
            <button type="submit">Uploader</button>
            <button type="button" onClick={() => setShowUploadForm(null)}>Annuler</button>
          </form>
        </div>
      )}

      <style>
        {`
          .reservations-page {
            padding: 20px;
            background: #f4f6f9;
            min-height: 100vh;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .back-to-dashboard {
            background: #3498db;
            color: #fff;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
          }

          .back-to-dashboard:hover {
            background: #2980b9;
          }

          .reservations-section {
            margin-top: 20px;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }

          .add-reservation-btn {
            background: #3498db;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .add-reservation-btn:hover {
            background: #2980b9;
          }

          .reservation-list table {
            width: 100%;
            border-collapse: collapse;
          }

          .reservation-list th,
          .reservation-list td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }

          .reservation-list th {
            background: #3498db;
            color: #fff;
          }

          .edit-btn, .delete-btn, .upload-btn, .delete-file-btn {
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 5px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          .edit-btn {
            background: #f1c40f;
            color: #fff;
          }

          .edit-btn:hover {
            background: #d4ac0d;
          }

          .delete-btn, .delete-file-btn {
            background: #e74c3c;
            color: #fff;
          }

          .delete-btn:hover, .delete-file-btn:hover {
            background: #c0392b;
          }

          .upload-btn {
            background: #2ecc71;
            color: #fff;
          }

          .upload-btn:hover {
            background: #27ae60;
          }

          .file-list {
            margin-top: 10px;
          }

          .file-list ul {
            list-style: none;
            padding: 0;
          }

          .file-list li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 0;
          }

          .add-reservation-form, .upload-files-form {
            margin-top: 20px;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            display: block;
            margin-bottom: 5px;
          }

          .form-group input,
          .form-group select,
          .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }

          .form-group textarea {
            height: 100px;
            resize: vertical;
          }

          .add-reservation-form button, .upload-files-form button {
            background: #3498db;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
          }

          .add-reservation-form button:hover, .upload-files-form button:hover {
            background: #2980b9;
          }

          .error-message {
            color: #e74c3c;
            margin-bottom: 10px;
            padding: 10px;
            background: #ffebee;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  );
};

export default DomainReservations;