import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("/auth/profile");
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  const winRate = user.totalBets > 0 
    ? ((user.wins / user.totalBets) * 100).toFixed(1) 
    : 0;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      
      <div className="profile-card">
        <h3>{user.username}</h3>
        <p className="email">{user.email}</p>
        
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Balance</span>
            <span className="stat-value">${user.balance?.toLocaleString()}</span>
          </div>
          
          <div className="stat-box">
            <span className="stat-label">Total Bets</span>
            <span className="stat-value">{user.totalBets}</span>
          </div>
          
          <div className="stat-box">
            <span className="stat-label">Wins</span>
            <span className="stat-value win">{user.wins}</span>
          </div>
          
          <div className="stat-box">
            <span className="stat-label">Losses</span>
            <span className="stat-value loss">{user.losses}</span>
          </div>
          
          <div className="stat-box">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">{winRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
