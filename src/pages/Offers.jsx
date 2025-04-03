// client/src/Offers.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [error, setError] = useState(null);

  // Récupérer toutes les offres
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/offers');
        setOffers(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des offres:', error.response ? error.response.data : error.message);
        setError('Erreur lors du chargement des offres.');
      }
    };
    fetchOffers();
  }, []);

  // Ajouter une offre
  const handleAddOffer = async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      duration_months: parseInt(e.target.duration_months.value),
      price: parseFloat(e.target.price.value),
      description: e.target.description.value,
      features: e.target.features.value,
      domain_type: e.target.domain_type.value || null,
      offer_type: e.target.offer_type.value,
      storage_space: e.target.storage_space.value ? parseInt(e.target.storage_space.value) : null,
      bandwidth: e.target.bandwidth.value ? parseInt(e.target.bandwidth.value) : null,
    };
    try {
      await axios.post('http://localhost:5000/api/offers', formData);
      setShowAddForm(false);
      const response = await axios.get('http://localhost:5000/api/offers');
      setOffers(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'offre:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'offre.');
    }
  };

  // Modifier une offre
  const handleEditOffer = async (e) => {
    e.preventDefault();
    if (!selectedOffer || !selectedOffer.id) {
      setError('Aucune offre sélectionnée pour la modification.');
      return;
    }
    const formData = {
      name: e.target.name.value,
      duration_months: parseInt(e.target.duration_months.value),
      price: parseFloat(e.target.price.value),
      description: e.target.description.value,
      features: e.target.features.value,
      domain_type: e.target.domain_type.value || null,
      offer_type: e.target.offer_type.value,
      storage_space: e.target.storage_space.value ? parseInt(e.target.storage_space.value) : null,
      bandwidth: e.target.bandwidth.value ? parseInt(e.target.bandwidth.value) : null,
    };
    try {
      await axios.put(`http://localhost:5000/api/offers/${selectedOffer.id}`, formData);
      setShowEditForm(false);
      setSelectedOffer(null);
      const response = await axios.get('http://localhost:5000/api/offers');
      setOffers(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la modification de l\'offre:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Erreur lors de la modification de l\'offre.');
    }
  };

  // Supprimer une offre
  const handleDeleteOffer = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/offers/${id}`);
        const response = await axios.get('http://localhost:5000/api/offers');
        setOffers(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'offre:', error.response ? error.response.data : error.message);
        setError(error.response?.data?.message || 'Erreur lors de la suppression de l\'offre.');
      }
    }
  };

  return (
    <div className="offers-page">
      <header className="page-header">
        <h1>Gestion des Offres</h1>
        <Link to="/dashboard" className="back-to-dashboard">
          Retour au Dashboard
        </Link>
      </header>

      {error && <div className="error-message">{error}</div>}
      <div className="offers-section">
        <h2>Liste des Offres</h2>
        <button className="add-offer-btn" onClick={() => setShowAddForm(true)}>
          <FaPlus /> Ajouter une offre
        </button>
        <div className="offer-list">
          {offers.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Durée (mois)</th>
                  <th>Prix (€)</th>
                  <th>Description</th>
                  <th>Fonctionnalités</th>
                  <th>Type de Domaine</th>
                  <th>Espace de Stockage (Go)</th>
                  <th>Bande Passante (Go)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td>{offer.name}</td>
                    <td>{offer.offer_type}</td>
                    <td>{offer.duration_months}</td>
                    <td>{offer.price}</td>
                    <td>{offer.description || 'N/A'}</td>
                    <td>{offer.features || 'N/A'}</td>
                    <td>{offer.domain_type || 'N/A'}</td>
                    <td>{offer.storage_space || 'N/A'}</td>
                    <td>{offer.bandwidth || 'N/A'}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setShowEditForm(true);
                        }}
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteOffer(offer.id)}
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucune offre trouvée.</p>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="add-offer-form">
          <h2>Ajouter une offre</h2>
          <form onSubmit={handleAddOffer}>
            <div className="form-group">
              <label>Nom :</label>
              <input type="text" name="name" required />
            </div>
            <div className="form-group">
              <label>Type d'Offre :</label>
              <select name="offer_type" required>
                <option value="domain">Domaine</option>
                <option value="hosting">Hébergement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Durée (mois) :</label>
              <input type="number" name="duration_months" required />
            </div>
            <div className="form-group">
              <label>Prix (€) :</label>
              <input type="number" step="0.01" name="price" required />
            </div>
            <div className="form-group">
              <label>Description :</label>
              <textarea name="description"></textarea>
            </div>
            <div className="form-group">
              <label>Fonctionnalités (séparées par des virgules) :</label>
              <input type="text" name="features" placeholder="SSL gratuit, Support 24/7" />
            </div>
            <div className="form-group">
              <label>Type de Domaine (pour les offres de domaine) :</label>
              <select name="domain_type">
                <option value="">Aucun</option>
                <option value="com">.com</option>
                <option value="org">.org</option>
                <option value="net">.net</option>
                <option value="fr">.fr</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>Espace de Stockage (Go, pour les offres d'hébergement) :</label>
              <input type="number" name="storage_space" />
            </div>
            <div className="form-group">
              <label>Bande Passante (Go, pour les offres d'hébergement) :</label>
              <input type="number" name="bandwidth" />
            </div>
            <button type="submit">Ajouter</button>
            <button type="button" onClick={() => setShowAddForm(false)}>Annuler</button>
          </form>
        </div>
      )}

      {/* Formulaire de modification */}
      {showEditForm && selectedOffer && (
        <div className="add-offer-form">
          <h2>Modifier l'offre</h2>
          <form onSubmit={handleEditOffer}>
            <div className="form-group">
              <label>Nom :</label>
              <input type="text" name="name" defaultValue={selectedOffer.name} required />
            </div>
            <div className="form-group">
              <label>Type d'Offre :</label>
              <select name="offer_type" defaultValue={selectedOffer.offer_type} required>
                <option value="domain">Domaine</option>
                <option value="hosting">Hébergement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Durée (mois) :</label>
              <input type="number" name="duration_months" defaultValue={selectedOffer.duration_months} required />
            </div>
            <div className="form-group">
              <label>Prix (€) :</label>
              <input type="number" step="0.01" name="price" defaultValue={selectedOffer.price} required />
            </div>
            <div className="form-group">
              <label>Description :</label>
              <textarea name="description" defaultValue={selectedOffer.description}></textarea>
            </div>
            <div className="form-group">
              <label>Fonctionnalités (séparées par des virgules) :</label>
              <input type="text" name="features" defaultValue={selectedOffer.features} />
            </div>
            <div className="form-group">
              <label>Type de Domaine (pour les offres de domaine) :</label>
              <select name="domain_type" defaultValue={selectedOffer.domain_type}>
                <option value="">Aucun</option>
                <option value="com">.com</option>
                <option value="org">.org</option>
                <option value="net">.net</option>
                <option value="fr">.fr</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>Espace de Stockage (Go, pour les offres d'hébergement) :</label>
              <input type="number" name="storage_space" defaultValue={selectedOffer.storage_space} />
            </div>
            <div className="form-group">
              <label>Bande Passante (Go, pour les offres d'hébergement) :</label>
              <input type="number" name="bandwidth" defaultValue={selectedOffer.bandwidth} />
            </div>
            <button type="submit">Modifier</button>
            <button type="button" onClick={() => setShowEditForm(false)}>Annuler</button>
          </form>
        </div>
      )}

      <style>
        {`
          .offers-page {
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

          .offers-section {
            margin-top: 20px;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }

          .add-offer-btn {
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

          .add-offer-btn:hover {
            background: #2980b9;
          }

          .offer-list table {
            width: 100%;
            border-collapse: collapse;
          }

          .offer-list th,
          .offer-list td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }

          .offer-list th {
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

          .add-offer-form {
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

          .add-offer-form button {
            background: #3498db;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
          }

          .add-offer-form button:hover {
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

export default Offers;