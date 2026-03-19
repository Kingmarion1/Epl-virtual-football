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

  // HANDLES ADDING/REMOVING FROM SLIP
  const toggleSelection = (selection) => {
    setBetSlip(prev => {
      // If clicking the same match + same prediction, remove it
      const exists = prev.find(s => s.matchId === selection.matchId && s.prediction === selection.prediction);
      if (exists) return prev.filter(s => !(s.matchId === selection.matchId && s.prediction === selection.prediction));
      
      // If clicking a different prediction for the same match, swap it
      const sameMatch = prev.find(s => s.matchId === selection.matchId);
      if (sameMatch) {
        return prev.map(s => s.matchId === selection.matchId ? selection : s);
      }

      // Otherwise, add new selection
      return [...prev, selection];
    });
  };

  const calculateTotalOdds = () => {
    return betSlip.reduce((acc, s) => acc * s.odds, 1).toFixed(2);
  };

  const handlePlaceBet = async () => {
    if (betSlip.length === 0) return;
    if (!stake || stake < 1) return alert("Please enter a valid stake");
    if (parseFloat(stake) > user.balance) return alert("Insufficient balance!");

    try {
      const totalOdds = calculateTotalOdds();
      const payload = {
        selections: betSlip.map(s => ({
          match: s.matchId,
          betType: s.betType,
          prediction: s.prediction,
          odds: s.odds
        })),
        stake: parseFloat(stake),
        totalOdds: parseFloat(totalOdds),
        potentialWin: parseFloat(stake) * parseFloat(totalOdds)
      };

      const res = await API.post("/bets/place", payload);
      
      // Update UI
      updateBalance(res.data.user.newBalance);
      setBetSlip([]);
      setStake("");
      alert("🔥 Bet Placed! Good luck!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place bet");
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
          <div className="phase-notice">
            The whistle has blown! Betting is closed for this round.
          </div>
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
            <h3>Bet Slip</h3>
            <button className="clear-btn" onClick={() => setBetSlip([])}>Clear</button>
          </div>
          
          <div className="slip-items">
            {betSlip.map((s, idx) => (
              <div key={idx} className="slip-item">
                <div className="slip-item-top">
                  <strong>{s.prediction.toUpperCase()}</strong>
                  <span className="slip-odds">@{s.odds}</span>
                </div>
                <p>{s.teams}</p>
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
              placeholder="Stake Amount ($)" 
              value={stake} 
              onChange={(e) => setStake(e.target.value)}
            />
            <button 
              className="place-bet-btn" 
              onClick={handlePlaceBet}
              disabled={phase !== "betting"}
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
         
