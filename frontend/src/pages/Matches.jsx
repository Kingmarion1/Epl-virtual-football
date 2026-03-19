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
  
  // NEW: Accumulator State
  const [betSlip, setBetSlip] = useState([]);
  const [stake, setStake] = useState("");
  const { user, updateBalance } = useAuth();

  useEffect(() => {
    const interval = setInterval(fetchMatches, 1000);
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

  // NEW: Function to add/remove selections
  const toggleSelection = (selection) => {
    const exists = betSlip.find(s => s.matchId === selection.matchId);
    if (exists) {
      setBetSlip(betSlip.filter(s => s.matchId !== selection.matchId));
    } else {
      setBetSlip([...betSlip, selection]);
    }
  };

  const handlePlaceBet = async () => {
    if (!stake || stake <= 0) return alert("Enter a valid stake");
    if (stake > user.balance) return alert("Insufficient balance!");

    const totalOdds = betSlip.reduce((acc, s) => acc * s.odds, 1);
    
    try {
      const payload = {
        selections: betSlip.map(s => ({
          match: s.matchId,
          betType: s.betType,
          prediction: s.prediction,
          odds: s.odds
        })),
        stake: Number(stake),
        totalOdds: totalOdds,
        potentialWin: Number(stake) * totalOdds
      };

      await API.post("/bets", payload);
      alert("Bet Placed Successfully! ✅");
      setBetSlip([]); // Clear slip
      setStake("");
      updateBalance(); // Refresh user money
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place bet");
    }
  };

  if (loading) return <div className="loading">Loading matches...</div>;

  return (
    <div className="matches-container">
      <div className="matches-page">
        <div className="match-header">
          <h2>Matchweek</h2>
          <div className={`phase-badge ${phase}`}>
            {phase === "betting" ? `⏱️ Betting Open (${countdown}s)` : `⚽ ${phase.toUpperCase()}`}
          </div>
        </div>

        <div className="matches-grid">
          {matches.map(match => (
            <MatchCard 
              key={match._id} 
              match={match} 
              canBet={phase === "betting"}
              onSelect={toggleSelection} // Pass this to MatchCard
              selectedOnes={betSlip} // Highlight what's picked
            />
          ))}
        </div>
      </div>

      {/* NEW: THE BET SLIP SIDEBAR */}
      {betSlip.length > 0 && (
        <div className="bet-slip">
          <h3>Your Selections ({betSlip.length})</h3>
          <div className="slip-items">
            {betSlip.map(s => (
              <div key={s.matchId} className="slip-item">
                <span>{s.teams}</span>
                <strong>{s.prediction.toUpperCase()} @ {s.odds}</strong>
              </div>
            ))}
          </div>
          <div className="slip-footer">
            <p>Total Odds: {betSlip.reduce((acc, s) => acc * s.odds, 1).toFixed(2)}</p>
            <input 
              type="number" 
              placeholder="Stake Amount" 
              value={stake} 
              onChange={(e) => setStake(e.target.value)} 
            />
            <button onClick={handlePlaceBet} className="place-bet-btn">
              Place {betSlip.length > 1 ? "Accumulator" : "Single"} Bet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Matches;
      
