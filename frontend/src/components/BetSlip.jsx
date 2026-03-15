import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "./BetSlip.css";

function BetSlip() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyBets();
      const interval = setInterval(fetchMyBets, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchMyBets = async () => {
    try {
      const res = await API.get("/bets/my-bets");
      setBets(res.data.bets || []);
    } catch (err) {
      console.error("Failed to fetch bets:", err);
    }
  };

  if (!isAuthenticated) return null;

  const pendingBets = bets.filter(b => b.status === "pending");
  const settledBets = bets.filter(b => b.status !== "pending").slice(0, 5);

  return (
    <div className="bet-slip">
      <h3>My Bets</h3>
      
      {pendingBets.length > 0 && (
        <div className="pending-bets">
          <h4>Pending ({pendingBets.length})</h4>
          {pendingBets.map(bet => (
            <div key={bet._id} className="bet-item pending">
              <span className="bet-type">{bet.betType}</span>
              <span className="bet-prediction">{bet.prediction}</span>
              <span className="bet-odds">@{bet.odds}</span>
              <span className="bet-stake">${bet.stake}</span>
              <span className="potential-win">Win: ${bet.potentialWin}</span>
            </div>
          ))}
        </div>
      )}

      {settledBets.length > 0 && (
        <div className="settled-bets">
          <h4>Recent Results</h4>
          {settledBets.map(bet => (
            <div key={bet._id} className={`bet-item ${bet.status}`}>
              <span className="bet-result">{bet.status.toUpperCase()}</span>
              <span className="bet-amount">
                {bet.status === "won" ? `+$${bet.potentialWin}` : `-$${bet.stake}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BetSlip;
