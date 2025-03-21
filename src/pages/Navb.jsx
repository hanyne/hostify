// Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoPW from '../assets/img/logo/logoPW.png';
import { FaLock, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import '.././Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.id || 'ID non disponible';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleForgotPassword = () => {
    navigate(`/forgot-password?userId=${userId}`);
  };

  const handleUpdatePassword = () => {
    navigate(`/update-password?userId=${userId}`);
  };

  return (
    <header className="header header-6">
      <div className="navbar-area">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <nav className="navbar navbar-expand-lg">
                <a className="navbar-brand" href="#home">
                  <img src={logoPW} alt="Logo" />
                </a>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarSupportedContent6"
                  aria-controls="navbarSupportedContent6"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="toggler-icon"></span>
                  <span className="toggler-icon"></span>
                  <span className="toggler-icon"></span>
                </button>

                <div
                  className="collapse navbar-collapse sub-menu-bar"
                  id="navbarSupportedContent6"
                >
                  <ul id="nav6" className="navbar-nav ms-auto">
                    <li className="nav-item">
                      <a className="page-scroll active" href="#home">
                        Home
                      </a>
                    </li>
                    {!user.email && (
                      <li className="nav-item">
                        <a className="page-scroll" href="/login">
                          Login
                        </a>
                      </li>
                    )}
                    <li className="nav-item">
                      <a className="page-scroll" href="#about">
                        About
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="page-scroll" href="#pricing">
                        Pricing
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="page-scroll" href="#contact">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>

                {user.email && (
                  <div className="navbar-profile">
                    <div className="user-profile">
                      <span className="user-name">{`${user.prenom} ${user.nom}`}</span>
                      <div className="dropdown-menu">
                        <button
                          className="dropdown-item"
                          onClick={handleForgotPassword}
                        >
                          <FaLock /> Mot de passe oublié
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={handleUpdatePassword}
                        >
                          <FaEdit /> Update password
                        </button>
                        <button
                          className="dropdown-item logout-item"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt /> Déconnexion
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {!user.email && (
                  <div className="header-action d-flex">
                    <a href="#0">
                      <i className="lni lni-cart"></i>
                    </a>
                    <a href="#0">
                      <i className="lni lni-alarm"></i>
                    </a>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;