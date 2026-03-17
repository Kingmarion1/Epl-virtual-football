import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "./MatchCard.css";

function MatchCard({ match, canBet }) {
  const [loading, setLoading] = useState(false);
  const { user, updateBalance } = useAuth();

  // Safely access nested properties
  const homeTeam = match.homeTeam?.name || "Home";
  const awayTeam = match.awayTeam?.name || "Away";
  const homeStrength = match.homeTeam?.strength || 0;
  const awayStrength = match.awayTeam?.strength || 0;
  
  // Safely access odds with defaults
  const odds = match.odds || {};
  const homeOdds = odds.home || 1.5;
  const drawOdds = odds.draw || 3.5;
  const awayOdds = odds.away || 1.5;
  const over25 = odds.over25 || 1.8;
  const under25 = odds.under25 || 1.9;
  const ggOdds = odds.gg || 1.7;
  const ngOdds = odds.ng || 1.8;

  const handleBet = async (betType, prediction, oddsValue) => {
    if (!canBet || loading) return;
    
    const stake = prompt(`Enter stake (Balance: $${user?.balance || 0}):`, "100");
    if (!stake || isNaN(stake) || stake < 1) return;
    if (parseFloat(stake) > (user?.balance || 0)) {
      alert("Insufficient balance!");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/bets/place", {
        selections: [{
          matchId: match._id,
          betType,
          prediction,
          odds: oddsValue
        }],
        stake: parseFloat(stake)
      });

      updateBalance(res.data.user.newBalance);
      alert(`Bet placed! Potential win: $${res.data.bet.potentialWin}`);
    } catch (err) {
      alert(err.response?.data?.message || "Bet failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`match-card ${match.status}`}>
      <div className="match-teams">
        <div className="team home">
          <span className="team-name">{homeTeam}</span>
          <span className="strength">STR: {homeStrength}</span>
          {match.status === "finished" && (
            <span className="score">{match.homeScore}</span>
          )}
        </div>
        
        <div className="vs">
          {match.status === "playing" ? "LIVE" : "VS"}
          {match.status === "finished" && (
            <div className="final-score">
              {match.homeScore} - {match.awayScore}
            </div>
          )}
        </div>
        
        <div className="team away">
          <span className="team-name">{awayTeam}</span>
          <span className="strength">STR: {awayStrength}</span>
          {match.status === "finished" && (
            <span className="score">{match.awayScore}</span>
          )}
        </div>
      </div>

      {/* SHOW ODDS FOR ALL MATCHES */}
      <div className="odds-container">
        {/* 1X2 */}
        <div className="odds-section">
          <h4>1X2</h4>
          <div className="odds-buttons">
            <button 
              onClick={() => handleBet("1X2", "home", homeOdds)}
              disabled={!canBet || loading || match.status !== "upcoming"}
              className="odd-btn"
            >
              <span className="label">1</span>
              <span className="value">{homeOdds}</span>
            </button>
            <button 
              onClick={() => handleBet("1X2", "draw", drawOdds)}
              disabled={!canBet || loading || match.status !== "upcoming"}
              className="odd-btn"
            >
              <span className="label">X</span>
              <span className="value">{drawOdds}</span>
            </button>
            <button 
              onClick={() => handleBet("1X2", "away", awayOdds)}
              disabled={!canBet || loading || match.status !== "upcoming"}
              className="odd-btn"
            >
              <span className="label">2</span>
              <span className="value">{awayOdds}</span>
            </button>
          </div>
        </div>

        {/* Over/Under */}
        <div className="odds-section">
          <h4>Over/Under 2.5</h4>
          <div className="odds-buttons">
            <button 
              onClick={() => handleBet("OVER_UNDER", "over2.5", over25)}
              disabled={!canBet || loading || match.status !== "upcoming"}
              className="odd-btn"
            >
              <span className="label">Over</span>
              <span className="value">{over25}</span>
            </button>
            <button 
              onClick={() => handleBet("OVER_UNDER", "under2.5", under25)}
              disabled={!canBet || loading || match.status !== "upcoming"}
              className="odd-btn"
            >
              <span className="label">Under</span>
              <span className="value">{under25}</span>
            </button>
          </div>
        </div>

        {/* GG/NG */}
        <div className="odds-section">
          <h4>Both Teams Score</h4>
          <div className="odds-buttons">
            <button 
              onClick={() => handleBet("GG_NG", "gg", ggOdds)}
              disabled={!canBet || loading || match.status !== "upcoming"}
              className="odd-btn"
            >
              <span className="label">Yes</span>
              <span className="value">{ggOdds}</span>
            </button>
            <button 
              onClick={() => handleBet("GG_NG", "ng", ngOdds)}
              disabled={!canBet || loading || match.status !== "upcoming"}
              className="odd-btn"
            >
              <span className="label">No</span>
              <span className="value">{ngOdds}</span>
            </button>
          </div>
        </div>
      </div>

      {match.status === "finished" && (
        <div className="match-result">
          Final Result: {match.homeScore} - {match.awayScore}
        </div>
      )}
    </div>
  );
}

export default MatchCard;
