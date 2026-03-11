import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../config/api.js";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const errorMsg = params.get("error");

    if (errorMsg) {
      setError(errorMsg);
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    if (!accessToken || !refreshToken) {
      setError("Authentication failed: missing tokens.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    // Fetch user profile with the access token
    axios
      .get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        const userData = res.data.user || res.data;
        login(userData, accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        navigate("/", { replace: true });
      })
      .catch(() => {
        setError("Authentication failed: could not load profile.");
        setTimeout(() => navigate("/login"), 3000);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">{error}</p>
          <p className="text-gray-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <svg
          className="animate-spin h-10 w-10 text-purple-500 mx-auto mb-4"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-white text-lg">Signing you in with GitHub...</p>
      </div>
    </div>
  );
}
