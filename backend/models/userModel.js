// server/models/userModel.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      console.error('Error in findByEmail:', error.message);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error in findById:', error.message);
      throw error;
    }
  }

  static async findAllClients() {
    try {
      const [rows] = await pool.query(
        'SELECT id, nom, prenom, email, role FROM users WHERE role = "client"'
      );
      return rows;
    } catch (error) {
      console.error('Error in findAllClients:', error.message);
      throw error;
    }
  }

  static async createUser(nom, prenom, email, mot_de_passe, role = 'client') {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(mot_de_passe, salt);
      await pool.query(
        'INSERT INTO users (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
        [nom, prenom, email, hashedPassword, role]
      );
    } catch (error) {
      console.error('Error in createUser:', error.message);
      throw error;
    }
  }

  static async updateClient(id, nom, prenom, email, role) {
    try {
      await pool.query(
        'UPDATE users SET nom = ?, prenom = ?, email = ?, role = ? WHERE id = ?',
        [nom, prenom, email, role, id]
      );
    } catch (error) {
      console.error('Error in updateClient:', error.message);
      throw error;
    }
  }

  static async deleteClient(id) {
    try {
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error in deleteClient:', error.message);
      throw error;
    }
  }

  static async createResetToken(email, token, expires) {
    try {
      await pool.query(
        'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expires]
      );
    } catch (error) {
      console.error('Error in createResetToken:', error.message);
      throw error;
    }
  }

  static async findResetToken(token) {
    try {
      const [rows] = await pool.query('SELECT * FROM password_resets WHERE token = ?', [token]);
      return rows[0];
    } catch (error) {
      console.error('Error in findResetToken:', error.message);
      throw error;
    }
  }

  static async deleteResetToken(token) {
    try {
      await pool.query('DELETE FROM password_resets WHERE token = ?', [token]);
    } catch (error) {
      console.error('Error in deleteResetToken:', error.message);
      throw error;
    }
  }

  static async updatePassword(email, mot_de_passe) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(mot_de_passe, salt);
      await pool.query('UPDATE users SET mot_de_passe = ? WHERE email = ?', [hashedPassword, email]);
    } catch (error) {
      console.error('Error in updatePassword:', error.message);
      throw error;
    }
  }

  static async saveContactMessage(name, email, phone, company, message) {
    try {
      await pool.query(
        'INSERT INTO contact_messages (name, email, phone, company, message) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone || null, company || null, message]
      );
    } catch (error) {
      console.error('Error in saveContactMessage:', error.message);
      throw error;
    }
  }
}

module.exports = User;