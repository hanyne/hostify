// client/src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { FaServer, FaUsers, FaDollarSign, FaChartLine, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Clients from './Client';
import '../Dashboard.css';

const Dashboard = () => {
  const [showClients, setShowClients] = useState(false);
  const [clientCount, setClientCount] = useState(0);

  return (
    <div className="dashboard-container">
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
                <FaServer className="icon" /> Réservations
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

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Bienvenue, Admin</h1>
          <div className="user-profile">
            <img src="https://via.placeholder.com/40" alt="Profil" onError={(e) => (e.target.style.display = 'none')} />
          </div>
        </header>

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
        </div>

        {showClients && <Clients setClientCount={setClientCount} />}

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

      <style>
        {`
          .dashboard-container {
            display: flex;
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          .sidebar {
            width: 250px;
            background: #2c3e50;
            color: #fff;
            padding: 20px 0;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
          }

          .sidebar-header {
            padding: 10px 20px;
            border-bottom: 1px solid #34495e;
            text-align: center;
          }

          .sidebar-nav ul {
            list-style: none;
            padding: 0;
          }

          .sidebar-nav ul li {
            padding: 15px 20px;
            cursor: pointer;
            transition: background 0.3s;
            display: flex;
            align-items: center;
          }

          .sidebar-nav ul li:hover,
          .sidebar-nav ul li.active {
            background: #34495e;
          }

          .sidebar-nav ul li .icon {
            margin-right: 10px;
            font-size: 1.2rem;
          }

          .sidebar-nav ul li a {
            color: #fff;
            text-decoration: none;
            display: flex;
            align-items: center;
            width: 100%;
          }

          .sidebar-nav ul li.logout {
            margin-top: auto;
          }

          .main-content {
            flex: 1;
            padding: 40px;
            background: #f4f6f9;
            overflow-y: auto;
          }

          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }

          .dashboard-header h1 {
            font-size: 2.5rem;
            color: #2c3e50;
          }

          .user-profile img {
            border-radius: 50%;
            width: 40px;
            height: 40px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }

          .stat-card {
            background: #fff;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.2s;
          }

          .stat-card:hover {
            transform: translateY(-5px);
          }

          .stat-icon {
            font-size: 2rem;
            color: #3498db;
            margin-bottom: 10px;
          }

          .stat-card h3 {
            font-size: 1.8rem;
            color: #2c3e50;
            margin: 0;
          }

          .stat-card p {
            color: #555;
            margin: 5px 0 0;
          }

          .recent-activity {
            background: #fff;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          }

          .recent-activity h2 {
            font-size: 1.5rem;
            color: #2c3e50;
            margin-bottom: 20px;
          }

          .activity-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
          }

          .activity-item p {
            margin: 0;
            color: #555;
          }

          .activity-item span {
            color: #888;
            font-size: 0.9rem;
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;