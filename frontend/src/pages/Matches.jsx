import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import MatchCard from "../components/MatchCard";
import "./Matches.css";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("betting");
  const [countdown, setCountdown] = useState(60);
  
  const { updateBalance } = useAuth();

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 1000); // Refresh every 1s
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await API.get("/matches/current");
      setMatches(res.data.data.matches || []);
      setPhase(res.data.data.phase || "betting");
      setCountdown(res.data.data.countdown || 60);
    } catch (err) {
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading matches...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="matches-page">
      <div className="match-header">
        <h2>Matchweek</h2>
        <div className={`phase-badge ${phase}`}>
          {phase === "betting" && `⏱️ Betting Open (${countdown}s)`}
          {phase === "playing" && "⚽ Live Scores"}
          {phase === "results" && "📊 Results"}
        </div>
      </div>

      {phase !== "betting" && (
        <div className="phase-notice">
          Betting is closed. Matches are being played...
        </div>
      )}

      <div className="matches-grid">
        {matches.map(match => (
          <MatchCard 
            key={match._id} 
            match={match} 
            canBet={phase === "betting"}
          />
        ))}
      </div>
    </div>
  );
}

export default Matches;
