import React, { useState } from 'react';
import axios from 'axios';
import backgroundImage from '../assets/images/bg-01.jpg';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hostify-zvms.onrender.com/api' 
  : 'http://localhost:5000/api';

const Inscription = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      console.log('Submitting to:', `${API_URL}/inscription`, formData);
      const response = await axios.post(`${API_URL}/inscription`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setMessage(response.data.message || 'Inscription réussie !');
      setFormData({ nom: '', prenom: '', email: '', mot_de_passe: '' });
    } catch (error) {
      console.error('Inscription error:', error.response?.data || error.message);
      if (error.response?.status === 502) {
        setMessage('Erreur serveur (502). Veuillez réessayer plus tard ou contacter le support.');
      } else {
        setMessage(error.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="preloader" style={{ display: isLoading ? 'block' : 'none' }}>
        <p>Chargement...</p>
      </div>

      <div className="limiter">
        <div
          className="container-login100"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
            <form className="login100-form validate-form" onSubmit={handleSubmit}>
              <span className="login500-form-title p-b-49">Inscription</span>

              {message && <p className="text-center" style={{ color: message.includes('réussie') ? 'green' : 'red' }}>{message}</p>}

              <div className="wrap-input100 validate-input m-b-23" data-validate="Le nom est requis">
                <span className="label-input100">Nom</span>
                <input
                  className="input100"
                  type="text"
                  name="nom"
                  placeholder="Entrez votre nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <span className="focus-input100" data-symbol=""></span>
              </div>

              <div className="wrap-input100 validate-input m-b-23" data-validate="Le prénom est requis">
                <span className="label-input100">Prénom</span>
                <input
                  className="input100"
                  type="text"
                  name="prenom"
                  placeholder="Entrez votre prénom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <span className="focus-input100" data-symbol=""></span>
              </div>

              <div className="wrap-input100 validate-input m-b-23" data-validate="L'email est requis">
                <span className="label-input100">Email</span>
                <input
                  className="input100"
                  type="email"
                  name="email"
                  placeholder="Entrez votre email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <span className="focus-input100" data-symbol=""></span>
              </div>

              <div className="wrap-input100 validate-input" data-validate="Le mot de passe est requis">
                <span className="label-input100">Mot de passe</span>
                <input
                  className="input100"
                  type="password"
                  name="mot_de_passe"
                  placeholder="Entrez votre mot de passe"
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <span className="focus-input100" data-symbol=""></span>
              </div>

              <div className="text-right p-t-8 p-b-31">
                <a href="/forgot-password">Mot de passe oublié ?</a>
              </div>

              <div className="container-login100-form-btn">
                <div className="wrap-login100-form-btn">
                  <div className="login100-form-bgbtn"></div>
                  <button className="login100-form-btn" type="submit" disabled={isLoading}>
                    {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                  </button>
                </div>
              </div>

              <div className="txt1 text-center p-t-54 p-b-20">
                <span>Ou s'inscrire avec</span>
              </div>

              <div className="flex-c-m">
                <a href="#" className="login100-social-item bg1">
                  <i className="fa fa-facebook"></i>
                </a>
                <a href="#" className="login100-social-item bg2">
                  <i className="fa fa-twitter"></i>
                </a>
                <a href="#" className="login100-social-item bg3">
                  <i className="fa fa-google"></i>
                </a>
              </div>

              <div className="flex-col-c">
                <span className="txt1 p-b-17">Déjà inscrit ?</span>
                <a href="/login" className="txt2">
                  Se connecter
                </a>
              </div>
            </form>
          </div>
        </div>
        <div id="dropDownSelect1"></div>
      </div>
    </>
  );
};

export default Inscription;