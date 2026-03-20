import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <h1 className="error-code">404</h1>
        <div className="soccer-icon">⚽</div>
        <h2>Out of Bounds❗</h2>
        <p>The page you are looking for doesn't exist or is currently in VAR 🥽 review.</p>
        <button className="go-home-btn" onClick={() => navigate("/")}>
          Return to Stadium
        </button>
      </div>
    </div>
  );
}

export default NotFound;
