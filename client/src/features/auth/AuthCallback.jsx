import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api.js";
import AuthStatusCard from "./AuthStatusCard";

// The backend puts the tokens in the URL fragment (#accessToken=…&refreshToken=…)
// so they never reach server logs. Read on first render, before the effect clears it.
const readFragmentTokens = () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return {
    accessToken: params.get("accessToken"),
    refreshToken: params.get("refreshToken"),
  };
};

// GitHub OAuth lands here after the backend issues tokens
export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tokens] = useState(readFragmentTokens);
  const [error, setError] = useState(
    tokens.accessToken ? "" : "GitHub sign-in did not return a session.",
  );
  const handled = useRef(false);

  useEffect(() => {
    // Remove the tokens from the address bar and browser history immediately
    window.history.replaceState(null, "", window.location.pathname);

    // StrictMode runs effects twice in dev — only exchange the tokens once
    if (handled.current || !tokens.accessToken) return;
    handled.current = true;

    axios
      .get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      })
      .then(({ data }) => {
        login(data.user, tokens.accessToken, tokens.refreshToken);
        navigate("/dashboard", { replace: true });
      })
      .catch(() => setError("Could not load your account. Please try again."));
  }, [tokens, login, navigate]);

  return <AuthStatusCard title="Signing you in…" error={error} />;
}
