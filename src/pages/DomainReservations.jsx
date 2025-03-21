// DomainReservations.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DomainReservations = ({ isAdmin = false }) => {
  const [reservations, setReservations] = useState([]);
  const [offers, setOffers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [error, setError] = useState(null);

  // Récupérer les offres disponibles
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/offers');
        setOffers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des offres:', error.response ? error.response.data : error.message);
        setError('Erreur lors du chargement des offres.');
      }
    };
    fetchOffers();
  }, []);

  // Récupérer les réservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const url = 'http://localhost:5000/api/reservations';
        const response = await axios.get(url);
        setReservations(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error.response ? error.response.data : error.message);
        setError('Erreur lors du chargement des réservations.');
      }
    };
    fetchReservations();
  }, []);

  // Ajouter une réservation
  const handleAddReservation = async (e) => {
    e.preventDefault();
    const formData = {
      domainName: e.target.domainName.value,
      offerId: e.target.offerId.value,
      technologies: e.target.technologies.value,
      projectType: e.target.projectType.value,
      hostingNeeded: e.target.hostingNeeded.checked,
      additionalServices: Array.from(e.target.additionalServices)
        .filter(input => input.checked)
        .map(input => input.value)
        .join(','),
      preferredContactMethod: e.target.preferredContactMethod.value,
      projectDeadline: e.target.projectDeadline.value,
      budgetRange: e.target.budgetRange.value,
    };
    try {
      console.log('Envoi des données pour ajout:', formData);
      await axios.post('http://localhost:5000/api/reservations', formData);
      setShowAddForm(false);
      const url = 'http://localhost:5000/api/reservations';
      const response = await axios.get(url);
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
      offerId: e.target.offerId.value,
      technologies: e.target.technologies.value,
      projectType: e.target.projectType.value,
      hostingNeeded: e.target.hostingNeeded.checked,
      additionalServices: Array.from(e.target.additionalServices)
        .filter(input => input.checked)
        .map(input => input.value)
        .join(','),
      preferredContactMethod: e.target.preferredContactMethod.value,
      projectDeadline: e.target.projectDeadline.value,
      budgetRange: e.target.budgetRange.value,
    };
    try {
      console.log('Envoi des données pour modification:', formData);
      await axios.put(`http://localhost:5000/api/reservations/${selectedReservation.id}`, formData);
      setShowEditForm(false);
      setSelectedReservation(null);
      const url = 'http://localhost:5000/api/reservations';
      const response = await axios.get(url);
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
        console.log('Suppression de la réservation ID:', id);
        await axios.delete(`http://localhost:5000/api/reservations/${id}`);
        const url = 'http://localhost:5000/api/reservations';
        const response = await axios.get(url);
        setReservations(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la suppression de la réservation:', error.response ? error.response.data : error.message);
        setError(error.response?.data?.message || 'Erreur lors de la suppression de la réservation.');
      }
    }
  };

  return (
    <div className="domain-reservations-page">
      <header className="page-header">
        <h1>Gestion des Réservations de Domaine</h1>
        <Link to="/dashboard" className="back-to-dashboard">
          Retour au Dashboard
        </Link>
      </header>

      {error && <div className="error-message">{error}</div>}
      <div className="reservations-section">
        <h2>Liste des Réservations de Domaine</h2>
        <button className="add-reservation-btn" onClick={() => setShowAddForm(true)}>
          <FaPlus /> Ajouter une réservation
        </button>
        <div className="reservation-list">
          {reservations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  {isAdmin && <th>Client</th>}
                  <th>Nom de Domaine</th>
                  <th>Offre</th>
                  <th>Technologies</th>
                  <th>Type de Projet</th>
                  <th>Hébergement</th>
                  <th>Services Supp.</th>
                  <th>Contact</th>
                  <th>Date Limite</th>
                  <th>Budget</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    {isAdmin && (
                      <td>
                        {reservation.nom
                          ? `${reservation.nom} ${reservation.prenom} (${reservation.email})`
                          : 'Utilisateur non authentifié'}
                      </td>
                    )}
                    <td>{reservation.domain_name}</td>
                    <td>
                      {`${reservation.offer_name} (${reservation.duration_months} mois, ${reservation.price}€)`}
                      <br />
                      <small>{reservation.description}</small>
                      <br />
                      <small>Fonctionnalités: {reservation.features}</small>
                      <br />
                      <small>Type de domaine: {reservation.domain_type}</small>
                    </td>
                    <td>{reservation.technologies}</td>
                    <td>{reservation.project_type}</td>
                    <td>{reservation.hosting_needed ? 'Oui' : 'Non'}</td>
                    <td>{reservation.additional_services || 'Aucun'}</td>
                    <td>{reservation.preferred_contact_method}</td>
                    <td>{reservation.project_deadline || 'Non spécifié'}</td>
                    <td>{reservation.budget_range}€</td>
                    <td>{reservation.status}</td>
                    <td>
                      {reservation.status === 'pending' && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowEditForm(true);
                            }}
                          >
                            <FaEdit /> Modifier
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteReservation(reservation.id)}
                          >
                            <FaTrash /> Supprimer
                          </button>
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
              <label>Offre :</label>
              <select name="offerId" required>
                <option value="">Sélectionner une offre</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name} ({offer.duration_months} mois, {offer.price}€) - {offer.domain_type}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Technologies (séparées par des virgules) :</label>
              <input type="text" name="technologies" placeholder="HTML,CSS,React" required />
            </div>
            <div className="form-group">
              <label>Type de Projet :</label>
              <select name="projectType" required>
                <option value="portfolio">Portfolio</option>
                <option value="ecommerce">E-commerce</option>
                <option value="blog">Blog</option>
                <option value="business">Entreprise</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" name="hostingNeeded" />
                Besoin d'hébergement ?
              </label>
            </div>
            <div className="form-group">
              <label>Services supplémentaires :</label>
              <div>
                <label>
                  <input type="checkbox" name="additionalServices" value="SEO" />
                  SEO
                </label>
                <label>
                  <input type="checkbox" name="additionalServices" value="Maintenance" />
                  Maintenance
                </label>
                <label>
                  <input type="checkbox" name="additionalServices" value="Analytics" />
                  Analytics
                </label>
                <label>
                  <input type="checkbox" name="additionalServices" value="Backup" />
                  Sauvegarde
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Méthode de contact préférée :</label>
              <select name="preferredContactMethod" required>
                <option value="email">Email</option>
                <option value="phone">Téléphone</option>
                <option value="both">Les deux</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date limite du projet :</label>
              <input type="date" name="projectDeadline" />
            </div>
            <div className="form-group">
              <label>Plage de budget :</label>
              <select name="budgetRange" required>
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
              <label>Offre :</label>
              <select name="offerId" defaultValue={selectedReservation.offer_id} required>
                <option value="">Sélectionner une offre</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name} ({offer.duration_months} mois, {offer.price}€) - {offer.domain_type}
                  </option>
                ))}
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
                <option value="business">Entreprise</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" name="hostingNeeded" defaultChecked={selectedReservation.hosting_needed} />
                Besoin d'hébergement ?
              </label>
            </div>
            <div className="form-group">
              <label>Services supplémentaires :</label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="additionalServices"
                    value="SEO"
                    defaultChecked={selectedReservation.additional_services?.includes('SEO')}
                  />
                  SEO
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="additionalServices"
                    value="Maintenance"
                    defaultChecked={selectedReservation.additional_services?.includes('Maintenance')}
                  />
                  Maintenance
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="additionalServices"
                    value="Analytics"
                    defaultChecked={selectedReservation.additional_services?.includes('Analytics')}
                  />
                  Analytics
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="additionalServices"
                    value="Backup"
                    defaultChecked={selectedReservation.additional_services?.includes('Backup')}
                  />
                  Sauvegarde
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Méthode de contact préférée :</label>
              <select name="preferredContactMethod" defaultValue={selectedReservation.preferred_contact_method} required>
                <option value="email">Email</option>
                <option value="phone">Téléphone</option>
                <option value="both">Les deux</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date limite du projet :</label>
              <input type="date" name="projectDeadline" defaultValue={selectedReservation.project_deadline} />
            </div>
            <div className="form-group">
              <label>Plage de budget :</label>
              <select name="budgetRange" defaultValue={selectedReservation.budget_range} required>
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

      <style>
        {`
          .domain-reservations-page {
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
          .edit-btn, .delete-btn {
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
          .delete-btn {
            background: #e74c3c;
            color: #fff;
          }
          .delete-btn:hover {
            background: #c0392b;
          }
          .add-reservation-form {
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
          .form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          .form-group input[type="checkbox"] {
            width: auto;
            margin-right: 10px;
          }
          .form-group div {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
          }
          .add-reservation-form button {
            background: #3498db;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
          }
          .add-reservation-form button:hover {
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