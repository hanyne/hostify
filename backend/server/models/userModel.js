// server/models/userModel.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

 // server/models/userModel.js
static async findAllClients() {
  const [rows] = await pool.query(
      'SELECT id, nom, prenom, email, role FROM users WHERE role = "client"'
  ); // Supprimer le ? et passer la valeur directement
  return rows;
}

  static async createUser(nom, prenom, email, mot_de_passe, role = 'client') {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mot_de_passe, salt);
    await pool.query(
      'INSERT INTO users (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, role]
    );
  }

  static async updateClient(id, nom, prenom, email, role) {
    await pool.query(
      'UPDATE users SET nom = ?, prenom = ?, email = ?, role = ? WHERE id = ?',
      [nom, prenom, email, role, id]
    );
  }

  static async deleteClient(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }

  static async createResetToken(email, token, expires) {
    await pool.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
      [email, token, expires]
    );
  }

  static async findResetToken(token) {
    const [rows] = await pool.query('SELECT * FROM password_resets WHERE token = ?', [token]);
    return rows[0];
  }

  static async deleteResetToken(token) {
    await pool.query('DELETE FROM password_resets WHERE token = ?', [token]);
  }

  static async updatePassword(email, mot_de_passe) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mot_de_passe, salt);
    await pool.query('UPDATE users SET mot_de_passe = ? WHERE email = ?', [hashedPassword, email]);
  }

  static async saveContactMessage(name, email, phone, company, message) {
    await pool.query(
      'INSERT INTO contact_messages (name, email, phone, company, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, company || null, message]
    );
  }
}

module.exports = User;