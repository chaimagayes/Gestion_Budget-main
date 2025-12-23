import React from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // plus tard tu mettras ici la vraie logique d'authentification
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="title-section">
          <img src="/logo.png" alt="logo" className="logo-icon" />
          <h1 className="app-title">BudgetFlow</h1>
        </div>

        <p className="subtitle">Générez vos finances en toute simplicité</p>

        <div className="form-group">
          <label>Nom d'utilisateur</label>
          <input type="text" placeholder="Nom d'utilisateur" />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" placeholder="Mot de passe" />
        </div>

        <button className="btn-login" onClick={handleLogin}>
          Se connecter
        </button>

        <a href="#" className="forgot-link">
          Mot de passe oublié ?
        </a>

        <p className="register-text">
          Pas encore de compte ? <a href="#">S'inscrire</a>
        </p>
      </div>
    </div>
  );
}


