import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Matches from "./pages/Matches";
import Standings from "./pages/Standings";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import BalanceBar from "./components/BalanceBar";
import BetSlip from "./components/BetSlip";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <BalanceBar />
        <main>
          <Routes>
            <Route path="/" element={<Matches />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <BetSlip />
      </div>
    </BrowserRouter>
  );
}

export default App;
