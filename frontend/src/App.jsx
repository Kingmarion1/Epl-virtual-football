import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Matches from "./pages/Matches";
import Standings from "./pages/Standings";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

import BalanceBar from "./components/BalanceBar";

import Navbar from "./components/Navbar";

function App() {

  return (

    <BrowserRouter>
      
      <BalanceBar />
      <Navbar />

      <Routes>

        <Route path="/" element={<Matches />} />
        <Route path="/matches" element={<Matches />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/table" element={<Standings />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
