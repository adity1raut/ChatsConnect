import React, { createContext, useState, useContext } from "react";
import { clearDeviceKeys } from "../features/e2ee/keyStore";

const AuthContext = createContext(null);

// Restore the session synchronously so routes never render a logged-out flash
const readStoredUser = () => {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");
  if (!token || !userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    localStorage.removeItem("userData");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const login = (userData, token, refreshToken) => {
    localStorage.setItem("authToken", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    // The next person on this browser must not be able to read encrypted chats
    clearDeviceKeys();
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem("userData", JSON.stringify(merged));
    setUser(merged);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUser, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
