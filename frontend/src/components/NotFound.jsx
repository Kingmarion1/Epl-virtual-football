import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-code">404</h1>
        <div className="notfound-icon">⚽</div>
        <h2 className="notfound-title">Out of Bounds!</h2>
        <p className="notfound-text">
          It looks like you've wandered off the pitch. The page you're looking for 
          doesn't exist or has been moved to another league.
        </p>
        <button className="back-home-btn" onClick={() => navigate("/")}>
          Return to Stadium
        </button>
      </div>
    </div>
  );
}

export default NotFound;
      
