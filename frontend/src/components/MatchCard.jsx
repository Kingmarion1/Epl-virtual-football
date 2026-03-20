import { useState } from "react";
import "./MatchCard.css";

// We receive onSelect and selectedOnes from the parent (Matches.jsx)
function MatchCard({ match, canBet, onSelect, selectedOnes = [] }) {

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

  // HELPER: Checks if this specific bet is in the slip
  // Updated to check for both 'match' and 'matchId' for bulletproof matching
  const isSelected = (type, prediction) => {
    return selectedOnes.some(
      (s) => (s.match === match._id || s.matchId === match._id) && 
             s.betType === type && 
             s.prediction === prediction
    );
  };

  const handleSelection = (betType, prediction, oddsValue) => {
    // Prevent betting if match started or phase is closed
    if (!canBet || match.status !== "upcoming") return;

    // Send the data to the parent (Matches.jsx)
    onSelect({
      match: match._id,       // PRIMARY ID (Backend needs this)
      matchId: match._id,     // BACKUP ID (For frontend logic)
      teams: `${homeTeam} vs ${awayTeam}`,
      betType,
      prediction,
      odds: oddsValue
    });
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
          {match.status === "playing" ? <span className="live-badge">LIVE</span> : "VS"}
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

      <div className="odds-container">
        {/* Match Result Section */}
        <div className="odds-section">
          <h4>Match Result</h4>
          <div className="odds-buttons">
            <button 
              onClick={() => handleSelection("1X2", "home", homeOdds)}
              disabled={!canBet || match.status !== "upcoming"}
              className={`odd-btn ${isSelected("1X2", "home") ? "active" : ""}`}
            >
              <span className="label">1</span>
              <span className="value">{homeOdds}</span>
            </button>
            <button 
              onClick={() => handleSelection("1X2", "draw", drawOdds)}
              disabled={!canBet || match.status !== "upcoming"}
              className={`odd-btn ${isSelected("1X2", "draw") ? "active" : ""}`}
            >
              <span className="label">X</span>
              <span className="value">{drawOdds}</span>
            </button>
            <button 
              onClick={() => handleSelection("1X2", "away", awayOdds)}
              disabled={!canBet || match.status !== "upcoming"}
              className={`odd-btn ${isSelected("1X2", "away") ? "active" : ""}`}
            >
              <span className="label">2</span>
              <span className="value">{awayOdds}</span>
            </button>
          </div>
        </div>

        {/* Goals Section */}
        <div className="odds-section">
          <h4>Goals (O/U 2.5)</h4>
          <div className="odds-buttons">
            <button 
              onClick={() => handleSelection("OVER_UNDER", "over2.5", over25)}
              disabled={!canBet || match.status !== "upcoming"}
              className={`odd-btn ${isSelected("OVER_UNDER", "over2.5") ? "active" : ""}`}
            >
              <span className="label">Over</span>
              <span className="value">{over25}</span>
            </button>
            <button 
              onClick={() => handleSelection("OVER_UNDER", "under2.5", under25)}
              disabled={!canBet || match.status !== "upcoming"}
              className={`odd-btn ${isSelected("OVER_UNDER", "under2.5") ? "active" : ""}`}
            >
              <span className="label">Under</span>
              <span className="value">{under25}</span>
            </button>
          </div>
        </div>

        {/* Both Teams to Score Section */}
        <div className="odds-section">
          <h4>BTTS</h4>
          <div className="odds-buttons">
            <button 
              onClick={() => handleSelection("GG_NG", "gg", ggOdds)}
              disabled={!canBet || match.status !== "upcoming"}
              className={`odd-btn ${isSelected("GG_NG", "gg") ? "active" : ""}`}
            >
              <span className="label">Yes</span>
              <span className="value">{ggOdds}</span>
            </button>
            <button 
              onClick={() => handleSelection("GG_NG", "ng", ngOdds)}
              disabled={!canBet || match.status !== "upcoming"}
              className={`odd-btn ${isSelected("GG_NG", "ng") ? "active" : ""}`}
            >
              <span className="label">No</span>
              <span className="value">{ngOdds}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchCard;
