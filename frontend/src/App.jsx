import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Matches from "./pages/Matches";
import Standings from "./pages/Standings";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

// Components
import Navbar from "./components/Navbar";
import BalanceBar from "./components/BalanceBar";
import BetSlip from "./components/BetSlip";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <BalanceBar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/standings" 
                element={
                  <ProtectedRoute>
                    <Standings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all route for broken links */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          <BetSlip />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
                    
