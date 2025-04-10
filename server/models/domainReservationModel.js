// server/models/domainReservationModel.js
const pool = require('../db');
const path = require('path');
const fs = require('fs');

class DomainReservation {
  static async create(userId, domainName, offerId, hostingOfferId, technologies, projectType, hostingNeeded, additionalServices, preferredContactMethod, projectDeadline, budgetRange) {
    const [result] = await pool.query(
      'INSERT INTO domain_reservations (user_id, domain_name, offer_id, hosting_offer_id, technologies, project_type, hosting_needed, additional_services, preferred_contact_method, project_deadline, budget_range, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId || null, domainName, offerId, hostingOfferId, technologies, projectType, hostingNeeded, additionalServices, preferredContactMethod, projectDeadline, budgetRange, 'pending']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT dr.*, o.name AS offer_name, o.duration_months, o.price, o.description, o.features, o.domain_type, ho.name AS hosting_offer_name, ho.storage_space, ho.bandwidth, ho.price AS hosting_price, u.nom, u.prenom, u.email FROM domain_reservations dr JOIN offers o ON dr.offer_id = o.id LEFT JOIN offers ho ON dr.hosting_offer_id = ho.id LEFT JOIN users u ON dr.user_id = u.id WHERE dr.id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT dr.*, o.name AS offer_name, o.duration_months, o.price, o.description, o.features, o.domain_type, ho.name AS hosting_offer_name, ho.storage_space, ho.bandwidth, ho.price AS hosting_price FROM domain_reservations dr JOIN offers o ON dr.offer_id = o.id LEFT JOIN offers ho ON dr.hosting_offer_id = ho.id WHERE dr.user_id = ?',
      [userId]
    );
    return rows;
  }

  static async findAll() {
    const [rows] = await pool.query(
      'SELECT dr.*, o.name AS offer_name, o.duration_months, o.price, o.description, o.features, o.domain_type, ho.name AS hosting_offer_name, ho.storage_space, ho.bandwidth, ho.price AS hosting_price, u.nom, u.prenom, u.email FROM domain_reservations dr JOIN offers o ON dr.offer_id = o.id LEFT JOIN offers ho ON dr.hosting_offer_id = ho.id LEFT JOIN users u ON dr.user_id = u.id'
    );
    return rows;
  }

  static async update(id, domainName, offerId, hostingOfferId, technologies, projectType, hostingNeeded, additionalServices, preferredContactMethod, projectDeadline, budgetRange) {
    await pool.query(
      'UPDATE domain_reservations SET domain_name = ?, offer_id = ?, hosting_offer_id = ?, technologies = ?, project_type = ?, hosting_needed = ?, additional_services = ?, preferred_contact_method = ?, project_deadline = ?, budget_range = ?, updated_at = NOW() WHERE id = ? AND status = ?',
      [domainName, offerId, hostingOfferId, technologies, projectType, hostingNeeded, additionalServices, preferredContactMethod, projectDeadline, budgetRange, id, 'pending']
    );
  }

  static async delete(id) {
    const reservation = await this.findById(id);
    if (reservation && reservation.status === 'pending') {
      await pool.query('DELETE FROM domain_reservations WHERE id = ? AND status = ?', [id, 'pending']);
      // Supprimer les fichiers déployés si nécessaire
      const publicDir = path.join(__dirname, '../public/sites', reservation.domain_name);
      if (fs.existsSync(publicDir)) {
        fs.rmSync(publicDir, { recursive: true, force: true });
      }
    }
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE domain_reservations SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
  }

  static async updateDeployedUrl(id, deployedUrl) {
    await pool.query(
      'UPDATE domain_reservations SET deployed_url = ?, updated_at = NOW() WHERE id = ?',
      [deployedUrl, id]
    );
  }

  static async checkDomainAvailability(domainName) {
    const [rows] = await pool.query(
      'SELECT * FROM domain_reservations WHERE domain_name = ? AND status = ?',
      [domainName, 'accepted']
    );
    return rows.length === 0;
  }
}

module.exports = DomainReservation;