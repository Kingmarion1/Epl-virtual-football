import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "./MatchCard.css";

function MatchCard({ match, canBet }) {
  const [selectedOdds, setSelectedOdds] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, updateBalance } = useAuth();

  const handleBet = async (betType, prediction, odds) => {
    if (!canBet) return;
    
    const stake = prompt(`Enter stake amount (Balance: $${user?.balance}):`, "100");
    if (!stake || isNaN(stake) || stake < 1) return;
    if (stake > user?.balance) {
      alert("Insufficient balance!");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/bets/place", {
        matchId: match._id,
        betType,
        prediction,
        odds,
        stake: Number(stake)
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
          <span className="team-name">{match.homeTeam?.name || "Home"}</span>
          {match.status === "finished" && (
            <span className="score">{match.homeScore}</span>
          )}
        </div>
        <div className="vs">VS</div>
        <div className="team away">
          <span className="team-name">{match.awayTeam?.name || "Away"}</span>
          {match.status === "finished" && (
            <span className="score">{match.awayScore}</span>
          )}
        </div>
      </div>

      {match.status === "upcoming" && canBet && (
        <div className="odds-grid">
          {/* 1X2 */}
          <div className="odds-section">
            <h4>1X2</h4>
            <div className="odds-buttons">
              <button 
                onClick={() => handleBet("1X2", "home", match.homeOdds)}
                disabled={loading}
              >
                Home {match.homeOdds}
              </button>
              <button 
                onClick={() => handleBet("1X2", "draw", match.drawOdds)}
                disabled={loading}
              >
                Draw {match.drawOdds}
              </button>
              <button 
                onClick={() => handleBet("1X2", "away", match.awayOdds)}
                disabled={loading}
              >
                Away {match.awayOdds}
              </button>
            </div>
          </div>

          {/* Over/Under */}
          <div className="odds-section">
            <h4>Over/Under 2.5</h4>
            <div className="odds-buttons">
              <button 
                onClick={() => handleBet("OVER_UNDER", "over2.5", match.over25)}
                disabled={loading}
              >
                Over {match.over25}
              </button>
              <button 
                onClick={() => handleBet("OVER_UNDER", "under2.5", match.under25)}
                disabled={loading}
              >
                Under {match.under25}
              </button>
            </div>
          </div>

          {/* GG/NG */}
          <div className="odds-section">
            <h4>Both Teams Score</h4>
            <div className="odds-buttons">
              <button 
                onClick={() => handleBet("GG_NG", "gg", match.ggOdds)}
                disabled={loading}
              >
                Yes {match.ggOdds}
              </button>
              <button 
                onClick={() => handleBet("GG_NG", "ng", match.ngOdds)}
                disabled={loading}
              >
                No {match.ngOdds}
              </button>
            </div>
          </div>
        </div>
      )}

      {match.status === "finished" && (
        <div className="match-result">
          Final: {match.homeScore} - {match.awayScore}
        </div>
      )}
    </div>
  );
}

export default MatchCard;
