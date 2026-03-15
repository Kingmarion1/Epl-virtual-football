import { useEffect, useState } from "react";
import API from "../api/axios";
import "./Leaderboard.css";

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get("/leaderboard");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading leaderboard...</div>;

  return (
    <div className="leaderboard-page">
      <h2>🏆 Top Bettors</h2>
      
      <div className="leaderboard-list">
        {users.sort((a, b) => b.balance - a.balance).map((user, index) => (
          <div key={user._id} className={`leaderboard-item rank-${index + 1}`}>
            <span className="rank">{index + 1}</span>
            <span className="username">{user.username}</span>
            <span className="balance">${user.balance?.toLocaleString()}</span>
            <span className="win-rate">
              {user.totalBets > 0 
                ? ((user.wins / user.totalBets) * 100).toFixed(0) 
                : 0}% WR
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
