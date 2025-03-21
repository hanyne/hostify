// server/models/offerModel.js
const pool = require('../db');

class Offer {
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM offers WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM offers');
    return rows;
  }

  static async create(name, duration_months, price, description, features, domain_type) {
    const [result] = await pool.query(
      'INSERT INTO offers (name, duration_months, price, description, features, domain_type) VALUES (?, ?, ?, ?, ?, ?)',
      [name, duration_months, price, description, features, domain_type]
    );
    return result.insertId;
  }

  static async update(id, name, duration_months, price, description, features, domain_type) {
    await pool.query(
      'UPDATE offers SET name = ?, duration_months = ?, price = ?, description = ?, features = ?, domain_type = ? WHERE id = ?',
      [name, duration_months, price, description, features, domain_type, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM offers WHERE id = ?', [id]);
  }
}

module.exports = Offer;