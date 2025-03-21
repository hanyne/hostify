// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { FaServer, FaUsers, FaDollarSign, FaChartLine, FaCog, FaSignOutAlt, FaGlobe, FaClock } from 'react-icons/fa'; // Ajout de FaClock pour l'icône
import { Link } from 'react-router-dom';
import Clients from './Client';
import axios from 'axios';

const Dashboard = () => {
  const [showClients, setShowClients] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [pendingReservationsCount, setPendingReservationsCount] = useState(0); // Nouvel état pour le compteur
  const [error, setError] = useState(null);
  const isAdmin = true;

  // Récupérer les réservations pour l'admin
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reservations');
        setReservations(response.data);
        // Calculer le nombre de réservations non traitées (statut 'pending')
        const pendingCount = response.data.filter(reservation => reservation.status === 'pending').length;
        setPendingReservationsCount(pendingCount);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error.response ? error.response.data : error.message);
        setError('Erreur lors du chargement des réservations.');
      }
    };
    fetchReservations();
  }, []);

  // Valider ou refuser une réservation (admin)
  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/reservations/${id}/status`, { status });
      const response = await axios.get('http://localhost:5000/api/reservations');
      setReservations(response.data);
      // Recalculer le nombre de réservations non traitées après mise à jour
      const pendingCount = response.data.filter(reservation => reservation.status === 'pending').length;
      setPendingReservationsCount(pendingCount);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour du statut.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>HostAdmin</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <FaServer className="icon" /> Dashboard
            </li>
            <li onClick={() => setShowClients(!showClients)}>
              <FaUsers className="icon" /> Clients
            </li>
            <li>
              <Link to="/domain-reservations">
                <FaGlobe className="icon" /> Réservations de Domaine
              </Link>
            </li>
            <li>
              <FaDollarSign className="icon" /> Facturation
            </li>
            <li>
              <FaChartLine className="icon" /> Statistiques
            </li>
            <li>
              <FaCog className="icon" /> Paramètres
            </li>
            <li className="logout">
              <FaSignOutAlt className="icon" /> Déconnexion
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Bienvenue, Admin</h1>
          <div className="user-profile">
            <img src="https://via.placeholder.com/40" alt="Profil" onError={(e) => e.target.style.display = 'none'} />
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <FaServer className="stat-icon" />
            <div>
              <h3>25</h3>
              <p>Serveurs Actifs</p>
            </div>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <div>
              <h3>{clientCount}</h3>
              <p>Clients</p>
            </div>
          </div>
          <div className="stat-card">
            <FaDollarSign className="stat-icon" />
            <div>
              <h3>12,450€</h3>
              <p>Revenus Mensuels</p>
            </div>
          </div>
          <div className="stat-card">
            <FaChartLine className="stat-icon" />
            <div>
              <h3>98%</h3>
              <p>Uptime</p>
            </div>
          </div>
          {/* Nouvelle carte pour le compteur des réservations non traitées */}
          <div className="stat-card pending-reservations">
            <FaClock className="stat-icon" />
            <div>
              <h3>{pendingReservationsCount}</h3>
              <p>Réservations en attente</p>
            </div>
          </div>
        </div>

        {/* Afficher Clients */}
        {showClients && <Clients setClientCount={setClientCount} />}

        {/* Section Réservations pour l'admin (accepter/rejeter uniquement) */}
        <div className="reservations-section">
          <h2>Liste des Réservations de Domaine</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="reservation-list">
            {reservations.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
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
                      <td>
                        {reservation.nom
                          ? `${reservation.nom} ${reservation.prenom} (${reservation.email})`
                          : 'Utilisateur non authentifié'}
                      </td>
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
                        {isAdmin && reservation.status === 'pending' && (
                          <>
                            <button
                              className="accept-btn"
                              onClick={() => handleUpdateStatus(reservation.id, 'accepted')}
                            >
                              Accepter
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() => handleUpdateStatus(reservation.id, 'rejected')}
                            >
                              Refuser
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

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Activité Récente</h2>
          <div className="activity-list">
            <div className="activity-item">
              <p>Nouveau client ajouté: client123.com</p>
              <span>il y a 2 heures</span>
            </div>
            <div className="activity-item">
              <p>Mise à jour du serveur #5 terminée</p>
              <span>il y a 4 heures</span>
            </div>
          </div>
        </div>
      </main>

      {/* CSS */}
      <style>
        {`
          .dashboard-container {
            display: flex;
            height: 100vh;
          }

          .sidebar {
            width: 250px;
            background: #2c3e50;
            color: #fff;
            padding: 20px 0;
          }

          .sidebar-header {
            padding: 10px 20px;
            border-bottom: 1px solid #34495e;
          }

          .sidebar-nav ul {
            list-style: none;
            padding: 0;
          }

          .sidebar-nav ul li {
            padding: 15px 20px;
            cursor: pointer;
            transition: background 0.3s;
          }

          .sidebar-nav ul li:hover,
          .sidebar-nav ul li.active {
            background: #34495e;
          }

          .sidebar-nav ul li .icon {
            margin-right: 10px;
          }

          .sidebar-nav ul li.logout {
            margin-top: auto;
          }

          .sidebar-nav ul li a {
            color: #fff;
            text-decoration: none;
            display: flex;
            align-items: center;
          }

          .main-content {
            flex: 1;
            padding: 20px;
            background: #f4f6f9;
            overflow-y: auto;
          }

          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .user-profile img {
            border-radius: 50%;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Ajustement pour plus de cartes */
            gap: 20px;
            margin-bottom: 20px;
          }

          .stat-card {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.2s;
          }

          .stat-card:hover {
            transform: translateY(-3px); /* Effet de survol */
          }

          .stat-icon {
            font-size: 24px;
            color: #3498db;
            margin-bottom: 10px;
          }

          .pending-reservations .stat-icon {
            color: #e74c3c; /* Couleur rouge pour attirer l'attention */
          }

          .pending-reservations h3 {
            color: #e74c3c; /* Chiffre en rouge */
          }

          .clients-section {
            margin-top: 20px;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }

          .add-client-btn {
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

          .add-client-btn:hover {
            background: #2980b9;
          }

          .client-list table {
            width: 100%;
            border-collapse: collapse;
          }

          .client-list th,
          .client-list td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }

          .client-list th {
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

          .add-client-form {
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

          .form-group input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }

          .add-client-form button {
            background: #3498db;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
          }

          .add-client-form button:hover {
            background: #2980b9;
          }

          .recent-activity {
            margin-top: 20px;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }

          .activity-list {
            margin-top: 10px;
          }

          .activity-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
          }

          .error-message {
            color: #e74c3c;
            margin-bottom: 10px;
            padding: 10px;
            background: #ffebee;
            border-radius: 4px;
          }

          /* Styles pour la section des réservations */
          .reservations-section {
            margin-top: 20px;
            background: linear-gradient(145deg, #ffffff, #e6e6e6);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            border: 1px solid #ddd;
            position: relative;
            overflow: hidden;
          }

          .reservations-section h2 {
            font-size: 1.5rem;
            color: #2c3e50;
            margin-bottom: 20px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            display: inline-block;
          }

          .reservation-list {
            max-height: 400px;
            overflow-x: auto;
            overflow-y: auto;
          }

          .reservation-list table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }

          .reservation-list th,
          .reservation-list td {
            padding: 12px 15px;
            text-align: left;
            font-size: 0.9rem;
            border-bottom: 1px solid #e0e0e0;
            white-space: nowrap;
          }

          .reservation-list th {
            background: #3498db;
            color: #fff;
            position: sticky;
            top: 0;
            z-index: 1;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .reservation-list td {
            background: #fff;
            transition: background 0.3s;
          }

          .reservation-list tr:hover td {
            background: #f8f9fa;
          }

          .reservation-list small {
            color: #666;
            font-size: 0.8rem;
          }

          .accept-btn, .reject-btn {
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 8px;
            font-size: 0.9rem;
            transition: transform 0.1s, background 0.3s;
          }

          .accept-btn {
            background: #2ecc71;
            color: #fff;
          }

          .accept-btn:hover {
            background: #27ae60;
            transform: scale(1.05);
          }

          .reject-btn {
            background: #e74c3c;
            color: #fff;
          }

          .reject-btn:hover {
            background: #c0392b;
            transform: scale(1.05);
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;