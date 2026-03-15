import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setUser(user);
    return user;
  };

  const register = async (username, email, password) => {
    const res = await API.post("/auth/register", { username, email, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateBalance = (newBalance) => {
    setUser(prev => prev ? { ...prev, balance: newBalance } : null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateBalance,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
