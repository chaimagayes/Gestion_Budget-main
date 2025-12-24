import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="app-title">Créer un compte</h1>

        <div className="form-group">
          <label>Nom d'utilisateur</label>
          <input type="text" placeholder="Nom d'utilisateur" />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Email" />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" placeholder="Mot de passe" />
        </div>

        <button className="btn-login" onClick={handleRegister}>
          S'inscrire
        </button>

        <p className="register-text">
          Déjà un compte ? <Link to="/">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
