const pool = require('../db');

class DomainReservation {
  static async checkDomainAvailability(domainName) {
    if (!domainName || typeof domainName !== 'string') {
      throw new Error('domainName must be a non-empty string');
    }
    const [rows] = await pool.query(
      'SELECT id FROM domain_reservations WHERE domain_name = ? AND status != "rejected"',
      [domainName]
    );
    return rows.length === 0;
  }

  static async create(
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
    budgetRange,
    paymentStatus = 'unpaid'
  ) {
    const params = [
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
      budgetRange,
      paymentStatus,
    ];
    if (params.some((param) => param === undefined || param === null)) {
      throw new Error('One or more create parameters are undefined or null');
    }
    console.log('Creating reservation with params:', params);
    const [result] = await pool.query(
      'INSERT INTO domain_reservations (user_id, domain_name, offer_id, hosting_offer_id, technologies, project_type, hosting_needed, additional_services, preferred_contact_method, project_deadline, budget_range, payment_status, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending", NOW())',
      params
    );
    return result.insertId;
  }

  static async findById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid reservation ID');
    }
    const [rows] = await pool.query(
      'SELECT dr.*, o.name AS offer_name, o.duration_months, o.price, o.description, o.features, o.domain_type, ho.name AS hosting_offer_name, ho.storage_space, ho.bandwidth, ho.price AS hosting_price, u.nom, u.prenom, u.email, u.phone AS client_phone FROM domain_reservations dr JOIN offers o ON dr.offer_id = o.id LEFT JOIN offers ho ON dr.hosting_offer_id = ho.id LEFT JOIN users u ON dr.user_id = u.id WHERE dr.id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    const [rows] = await pool.query(
      'SELECT dr.*, o.name AS offer_name, o.duration_months, o.price, o.description, o.features, o.domain_type, ho.name AS hosting_offer_name, ho.storage_space, ho.bandwidth, ho.price AS hosting_price FROM domain_reservations dr JOIN offers o ON dr.offer_id = o.id LEFT JOIN offers ho ON dr.hosting_offer_id = ho.id WHERE dr.user_id = ?',
      [userId]
    );
    return rows;
  }

  static async findAll() {
    const [rows] = await pool.query(
      'SELECT dr.*, o.name AS offer_name, o.duration_months, o.price, o.description, o.features, o.domain_type, ho.name AS hosting_offer_name, ho.storage_space, ho.bandwidth, ho.price AS hosting_price, u.nom, u.prenom, u.email, u.phone AS client_phone FROM domain_reservations dr JOIN offers o ON dr.offer_id = o.id LEFT JOIN offers ho ON dr.hosting_offer_id = ho.id LEFT JOIN users u ON dr.user_id = u.id'
    );
    return rows;
  }

  static async update(
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
    budgetRange,
    paymentStatus
  ) {
    const params = [
      domainName,
      offerId,
      hostingOfferId,
      technologies,
      projectType,
      hostingNeeded,
      additionalServices,
      preferredContactMethod,
      projectDeadline,
      budgetRange,
      paymentStatus,
      id,
    ];
    if (params.some((param) => param === undefined)) {
      throw new Error('One or more update parameters are undefined');
    }
    console.log('Updating reservation with params:', params);
    await pool.query(
      'UPDATE domain_reservations SET domain_name = ?, offer_id = ?, hosting_offer_id = ?, technologies = ?, project_type = ?, hosting_needed = ?, additional_services = ?, preferred_contact_method = ?, project_deadline = ?, budget_range = ?, payment_status = ?, updated_at = NOW() WHERE id = ?',
      params
    );
  }

  static async updateStatus(id, status) {
    if (!id || isNaN(id) || !['pending', 'accepted', 'rejected'].includes(status)) {
      throw new Error('Invalid ID or status');
    }
    console.log('Updating status for reservation', id, 'to', status);
    await pool.query(
      'UPDATE domain_reservations SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
  }

  static async updatePaymentStatus(id, paymentStatus) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid reservation ID');
    }
    if (!paymentStatus || !['unpaid', 'paid'].includes(paymentStatus)) {
      console.error('Invalid payment status:', paymentStatus);
      throw new Error('Invalid payment status; must be "unpaid" or "paid"');
    }
    console.log('Updating payment status for reservation', id, 'to', paymentStatus);
    await pool.query(
      'UPDATE domain_reservations SET payment_status = ?, updated_at = NOW() WHERE id = ?',
      [paymentStatus, id]
    );
  }

  static async updateDeployedUrl(id, deployedUrl) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid reservation ID');
    }
    console.log('Updating deployed URL for reservation', id, 'to', deployedUrl);
    await pool.query(
      'UPDATE domain_reservations SET deployed_url = ?, updated_at = NOW() WHERE id = ?',
      [deployedUrl === null ? null : deployedUrl, id]
    );
  }

  static async delete(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid reservation ID');
    }
    console.log('Deleting reservation', id);
    await pool.query('DELETE FROM domain_reservations WHERE id = ?', [id]);
  }
}

module.exports = DomainReservation;