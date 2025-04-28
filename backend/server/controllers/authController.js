// server/controllers/authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const authController = {
  register: async (req, res) => {
    const { nom, prenom, email, mot_de_passe } = req.body;
    try {
      console.log('Register attempt:', { nom, prenom, email });
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        console.log('Email already exists:', email);
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }
      console.log('Creating new user...');
      await User.createUser(nom, prenom, email, mot_de_passe, 'client');
      console.log('User created successfully');
      res.status(201).json({ message: 'Client ajouté avec succès !' });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  login: async (req, res) => {
    const { email, mot_de_passe } = req.body;
    try {
      console.log('Login attempt:', { email });
      const user = await User.findByEmail(email);
      if (!user) {
        console.log('User not found:', email);
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }
      console.log('User found:', user.email);
      const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (!isMatch) {
        console.log('Password mismatch for user:', email);
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }
      console.log('Password matched, generating token...');
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ 
        message: 'Connexion réussie !', 
        token,
        user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error.message);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findByEmail(email);
      if (!user) return res.status(400).json({ message: "Cet email n'existe pas." });
      const token = crypto.randomBytes(20).toString('hex');
      const expires = new Date(Date.now() + 3600000);
      const formattedExpires = expires.toISOString().slice(0, 19).replace('T', ' ');
      await User.createResetToken(email, token, formattedExpires);
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      await transporter.sendMail({
        from: `"Réinitialisation" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`,
        html: `<p>Cliquez sur ce <a href="${resetLink}">lien</a> pour réinitialiser votre mot de passe.</p>`,
      });
      res.status(200).json({ message: 'Un lien de réinitialisation a été envoyé à votre email.' });
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  resetPassword: async (req, res) => {
    const { token, mot_de_passe } = req.body;
    try {
      const resetToken = await User.findResetToken(token);
      if (!resetToken || new Date() > new Date(resetToken.expires_at)) {
        return res.status(400).json({ message: 'Lien de réinitialisation invalide ou expiré.' });
      }
      await User.updatePassword(resetToken.email, mot_de_passe);
      await User.deleteResetToken(token);
      res.status(200).json({ message: 'Mot de passe réinitialisé avec succès !' });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  contact: async (req, res) => {
    const { name, email, phone, company, message } = req.body;
    try {
      if (!name || !email || !message) {
        return res.status(400).json({ message: 'Les champs nom, email et message sont requis.' });
      }
      await User.saveContactMessage(name, email, phone, company, message);
      res.status(200).json({ message: 'Message envoyé avec succès !' });
    } catch (error) {
      console.error('Erreur dans contact:', error.message);
      res.status(500).json({ message: 'Erreur serveur lors de l’envoi du message.' });
    }
  },
};

module.exports = authController;