import { useAuth } from "../context/AuthContext";
import "./BalanceBar.css";

function BalanceBar() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="balance-bar">
      <div className="balance-info">
        <span className="balance-label">Balance:</span>
        <span className="balance-amount">${user?.balance?.toLocaleString()}</span>
      </div>
      <div className="user-stats">
        <span>W: {user?.wins || 0}</span>
        <span>L: {user?.losses || 0}</span>
      </div>
    </div>
  );
}

export default BalanceBar;
