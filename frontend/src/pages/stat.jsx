// client/src/pages/Stats.jsx
import React, { useState, useEffect } from 'react';
import { FaUsers, FaDollarSign, FaGlobe, FaBox, FaFileAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const Stats = () => {
  const [stats, setStats] = useState({
    clients: 0,
    offers: 0,
    reservations: 0,
    hostedSites: 0,
    totalRevenue: 0,
    reservationStatusBreakdown: [],
    offerTypeBreakdown: [],
    revenueByMonth: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Token checked:', token ? 'Present' : 'Missing');
        if (!token) {
          console.log('Redirecting to /login due to missing token');
          navigate('/login');
          return;
        }

        // Fetch reservations
        const reservationsResponse = await axios.get('http://localhost:5000/api/reservations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Reservations API response:', reservationsResponse);
        const reservations = reservationsResponse.data;
        console.log('Parsed reservations data:', reservations);

        // Fetch offers
        const offersResponse = await axios.get('http://localhost:5000/api/offers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Offers API response:', offersResponse);
        const offers = offersResponse.data;
        console.log('Parsed offers data:', offers);

        // Fetch clients
        const clientsResponse = await axios.get('http://localhost:5000/api/users?role=client', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Clients API response:', clientsResponse);
        const clients = clientsResponse.data;
        console.log('Parsed clients data:', clients);

        // Calculate stats
        const hostedCount = reservations.filter(
          (res) => res.payment_status === 'paid' && res.hosting_needed
        ).length;
        console.log('Hosted sites count:', hostedCount);

        // Calculate total revenue
        const paidReservations = reservations.filter((res) => res.payment_status === 'paid');
        console.log('Paid reservations:', paidReservations);
        let totalRevenue = 0;
        for (const reservation of paidReservations) {
          const offer = offers.find((o) => o.id === reservation.offer_id);
          if (offer) {
            console.log(`Revenue from reservation ${reservation.id}:`, offer.price);
            totalRevenue += offer.price || 0;
          } else {
            console.log(`No offer found for reservation ${reservation.id}`);
          }
        }
        console.log('Total revenue calculated:', totalRevenue);

        // Reservation status breakdown
        const reservationStatusBreakdown = [
          { name: 'En attente', value: reservations.filter((r) => r.status === 'pending').length },
          { name: 'Accepté', value: reservations.filter((r) => r.status === 'accepted').length },
          { name: 'Refusé', value: reservations.filter((r) => r.status === 'rejected').length },
        ];
        console.log('Reservation status breakdown:', reservationStatusBreakdown);

        // Offer type breakdown
        const offerTypeBreakdown = [
          { name: 'Domaine', value: offers.filter((o) => o.offer_type === 'domain').length },
          { name: 'Hébergement', value: offers.filter((o) => o.offer_type === 'hosting').length },
        ];
        console.log('Offer type breakdown:', offerTypeBreakdown);

        // Revenue by month
        const revenueByMonth = [];
        const currentDate = new Date('2025-05-20');
        for (let i = 4; i >= 0; i--) {
          const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthReservations = paidReservations.filter((res) => {
            if (!res.created_at) {
              console.log(`Reservation ${res.id} missing created_at field`);
              return false;
            }
            const resDate = new Date(res.created_at);
            return resDate.getMonth() === monthDate.getMonth() && resDate.getFullYear() === monthDate.getFullYear();
          });
          let monthRevenue = 0;
          for (const res of monthReservations) {
            const offer = offers.find((o) => o.id === res.offer_id);
            if (offer) monthRevenue += offer.price || 0;
          }
          const monthName = monthDate.toLocaleString('fr-FR', { month: 'short' });
          revenueByMonth.push({ month: monthName, revenue: monthRevenue });
        }
        console.log('Revenue by month:', revenueByMonth);

        setStats({
          clients: clients.length,
          offers: offers.length,
          reservations: reservations.length,
          hostedSites: hostedCount,
          totalRevenue,
          reservationStatusBreakdown,
          offerTypeBreakdown,
          revenueByMonth,
        });
        setError(null);
      } catch (error) {
        console.error('Stats fetch error occurred:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError('Erreur lors de la récupération des statistiques. Veuillez vérifier la console pour plus de détails.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  const COLORS = ['#3498db', '#e67e22', '#e74c3c'];

  return (
    <div className="stats-page">
      <header className="page-header">
        <h1>Statistiques - Rapport</h1>
        <Link to="/dashboard" className="back-btn">
          Retour au Dashboard
        </Link>
      </header>

      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading">Chargement des statistiques...</div>
      ) : (
        <>
          <section className="stats-section">
            <h2>Vue d'ensemble</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <FaUsers className="stat-icon" />
                <div>
                  <h3>{stats.clients}</h3>
                  <p>Clients</p>
                </div>
              </div>
              <div className="stat-card">
                <FaDollarSign className="stat-icon" />
                <div>
                  <h3>{stats.totalRevenue.toLocaleString('fr-FR')}€</h3>
                  <p>Revenus Totaux</p>
                </div>
              </div>
              <div className="stat-card">
                <FaGlobe className="stat-icon" />
                <div>
                  <h3>{stats.hostedSites}</h3>
                  <p>Sites Hébergés</p>
                </div>
              </div>
              <div className="stat-card">
                <FaBox className="stat-icon" />
                <div>
                  <h3>{stats.offers}</h3>
                  <p>Offres</p>
                </div>
              </div>
              <div className="stat-card">
                <FaFileAlt className="stat-icon" />
                <div>
                  <h3>{stats.reservations}</h3>
                  <p>Réservations</p>
                </div>
              </div>
            </div>
          </section>

          <section className="charts-section">
            <h2>Analyse Détaillée</h2>
            <div className="charts-grid">
              <div className="chart-container">
                <h3>Répartition des Statuts de Réservations</h3>
                <BarChart width={400} height={300} data={stats.reservationStatusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3498db" />
                </BarChart>
              </div>
              <div className="chart-container">
                <h3>Répartition des Types d'Offres</h3>
                <PieChart width={400} height={300}>
                  <Pie
                    data={stats.offerTypeBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stats.offerTypeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
              <div className="chart-container">
                <h3>Revenus par Mois (5 derniers mois)</h3>
                <BarChart width={400} height={300} data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}€`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#2ecc71" />
                </BarChart>
              </div>
            </div>
          </section>
        </>
      )}

      <style>
        {`
          .stats-page {
            padding: 40px;
            background: #f4f6f9;
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }

          .page-header h1 {
            font-size: 2.5rem;
            color: #2c3e50;
          }

          .back-btn {
            background: #3498db;
            color: #fff;
            padding: 10px 20px;
            border-radius: 25px;
            text-decoration: none;
            transition: background 0.3s ease;
          }

          .back-btn:hover {
            background: #2980b9;
          }

          .error-message {
            background: #ffebee;
            color: #e74c3c;
            padding: 10px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.95rem;
            text-align: center;
          }

          .loading {
            text-align: center;
            color: #3498db;
            font-size: 1.2rem;
            margin: 20px 0;
          }

          .stats-section,
          .charts-section {
            background: #fff;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
          }

          .stats-section h2,
          .charts-section h2 {
            font-size: 1.8rem;
            color: #2c3e50;
            margin-bottom: 20px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }

          .stat-card {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            text-align: center;
            transition: transform 0.2s ease;
            border: 1px solid #ddd;
          }

          .stat-card:hover {
            transform: translateY(-5px);
          }

          .stat-icon {
            font-size: 2.5rem;
            color: #3498db;
            margin-bottom: 10px;
          }

          .stat-card h3 {
            font-size: 2rem;
            color: #2c3e50;
            margin: 0;
          }

          .stat-card p {
            color: #555;
            margin: 5px 0 0;
            font-size: 1rem;
          }

          .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            justify-items: center;
          }

          .chart-container {
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid #ddd;
          }

          .chart-container h3 {
            font-size: 1.3rem;
            color: #2c3e50;
            margin-bottom: 15px;
            text-align: center;
          }
        `}
      </style>
    </div>
  );
};

export default Stats;