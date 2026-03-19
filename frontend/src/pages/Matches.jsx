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
  
  // ACCUMULATOR STATES
  const [betSlip, setBetSlip] = useState([]);
  const [stake, setStake] = useState("");
  const { user, updateBalance } = useAuth();

  useEffect(() => {
    fetchMatches();
    // 3s interval protects your Render backend from 'Too Many Requests'
    const interval = setInterval(fetchMatches, 3000); 
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

  // NEW: Individual Remove Function
  const removeFromSlip = (matchId, prediction) => {
    setBetSlip(prev => prev.filter(s => !(s.matchId === matchId && s.prediction === prediction)));
  };

  // TOGGLE LOGIC (Keeps the 'matchId' key consistent)
  const toggleSelection = (selection) => {
    setBetSlip(prev => {
      const exists = prev.find(s => s.matchId === selection.matchId && s.prediction === selection.prediction);
      if (exists) return prev.filter(s => !(s.matchId === selection.matchId && s.prediction === selection.prediction));
      
      const sameMatch = prev.find(s => s.matchId === selection.matchId);
      if (sameMatch) {
        return prev.map(s => s.matchId === selection.matchId ? selection : s);
      }
      return [...prev, selection];
    });
  };

  const calculateTotalOdds = () => {
    const total = betSlip.reduce((acc, s) => acc * s.odds, 1);
    return parseFloat(total.toFixed(2));
  };

  const handlePlaceBet = async () => {
    if (betSlip.length === 0) return;
    if (!stake || stake < 1) return alert("Please enter a valid stake");
    if (Number(stake) > user.balance) return alert("Insufficient balance!");

    try {
      const totalOdds = calculateTotalOdds();
      const payload = {
        // HANDSHAKE FIX: Sending matchId as 'match' for the Backend
        selections: betSlip.map(s => ({
          match: s.matchId, 
          betType: s.betType,
          prediction: s.prediction,
          odds: Number(s.odds)
        })),
        stake: Number(stake),
        totalOdds: Number(totalOdds),
        potentialWin: Number((Number(stake) * totalOdds).toFixed(2))
      };

      const res = await API.post("/bets/place", payload);
      
      updateBalance(res.data.user.newBalance);
      setBetSlip([]);
      setStake("");
      alert("🔥 Bet Placed! Check the leaderboard!");
    } catch (err) {
      console.error("Payload Error:", err.response?.data);
      alert(`Error: ${err.response?.data?.message || "Something went wrong"}`);
    }
  };
  
  if (loading) return <div className="loading">Loading Stadium...</div>;

  return (
    <div className="matches-container">
      <div className="matches-page">
        <div className="match-header">
          <h2>EPL Virtual League</h2>
          <div className={`phase-badge ${phase}`}>
            {phase === "betting" ? `⏱️ Open: ${countdown}s` : `⚽ ${phase.toUpperCase()}`}
          </div>
        </div>

        {phase !== "betting" && (
          <div className="phase-notice">Betting closed for this round. Stay tuned!</div>
        )}

        <div className="matches-grid">
          {matches.map(match => (
            <MatchCard 
              key={match._id} 
              match={match} 
              canBet={phase === "betting"}
              onSelect={toggleSelection}
              selectedOnes={betSlip}
            />
          ))}
        </div>
      </div>

      {/* FLOATING BET SLIP */}
      {betSlip.length > 0 && (
        <div className="bet-slip">
          <div className="slip-header">
            <h3>Your Picks ({betSlip.length})</h3>
            <button className="clear-btn" onClick={() => setBetSlip([])}>Clear All</button>
          </div>
          
          <div className="slip-items">
            {betSlip.map((s, idx) => (
              <div key={idx} className="slip-item">
                <div className="slip-item-top">
                  <strong>{s.prediction.toUpperCase()}</strong>
                  <div className="slip-right-group">
                    <span className="slip-odds">@{s.odds}</span>
                    <button 
                      className="remove-item-btn" 
                      onClick={() => removeFromSlip(s.matchId, s.prediction)}
                    >
                      &times;
                    </button>
                  </div>
                </div>
                <p className="slip-match-name">{s.teams}</p>
              </div>
            ))}
          </div>

          <div className="slip-footer">
            <div className="summary-line">
              <span>Total Odds:</span>
              <strong>{calculateTotalOdds()}</strong>
            </div>
            {stake && (
              <div className="summary-line win">
                <span>Potential Win:</span>
                <strong>${(stake * calculateTotalOdds()).toFixed(2)}</strong>
              </div>
            )}
            <input 
              type="number" 
              placeholder="Stake ($)" 
              value={stake} 
              onChange={(e) => setStake(e.target.value)}
              className="stake-input"
            />
            <button 
              className="place-bet-btn" 
              onClick={handlePlaceBet}
              disabled={phase !== "betting" || !stake || stake < 1}
            >
              PLACE {betSlip.length > 1 ? "ACCUMULATOR" : "BET"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Matches;
      
