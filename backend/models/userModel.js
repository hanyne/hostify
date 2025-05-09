const pool = require('../db');
const bcrypt = require('bcrypt'); // Ensure bcrypt is imported for password hashing

const User = {
  findByEmail: async (email) => {
    try {
      console.log('Executing query for email:', email);
      const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
      console.log('Query result:', rows);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Database query error:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage || 'N/A',
        stack: error.stack,
      });
      throw error;
    }
  },

  createUser: async (nom, prenom, email, mot_de_passe, role) => {
    try {
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
      await pool.query(
        'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
        [nom, prenom, email, hashedPassword, role]
      );
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  createResetToken: async (email, token, expires_at) => {
    try {
      await pool.query(
        'INSERT INTO reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expires_at]
      );
    } catch (error) {
      console.error('Create reset token error:', error);
      throw error;
    }
  },

  findResetToken: async (token) => {
    try {
      const [rows] = await pool.query('SELECT * FROM reset_tokens WHERE token = ? LIMIT 1', [token]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Find reset token error:', error);
      throw error;
    }
  },

  updatePassword: async (email, mot_de_passe) => {
    try {
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
      await pool.query('UPDATE utilisateurs SET mot_de_passe = ? WHERE email = ?', [hashedPassword, email]);
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  deleteResetToken: async (token) => {
    try {
      await pool.query('DELETE FROM reset_tokens WHERE token = ?', [token]);
    } catch (error) {
      console.error('Delete reset token error:', error);
      throw error;
    }
  },

  saveContactMessage: async (name, email, phone, company, message) => {
    try {
      await pool.query(
        'INSERT INTO contact_messages (name, email, phone, company, message) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, company, message]
      );
    } catch (error) {
      console.error('Save contact message error:', error);
      throw error;
    }
  },
};

module.exports = User;