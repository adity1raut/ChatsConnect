import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api.js";
import AuthStatusCard from "./AuthStatusCard";

// Target of the emailed two-factor link: /auth/verify-2fa?token=…&email=…
export default function Verify2FA() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [error, setError] = useState(
    token && email ? "" : "This verification link is incomplete.",
  );
  const handled = useRef(false);

  useEffect(() => {
    // The link is single-use — keep the token out of the address bar and history
    window.history.replaceState(null, "", window.location.pathname);

    if (handled.current || !token || !email) return;
    handled.current = true;

    axios
      .post(`${API_URL}/auth/verify-2fa`, { token, email })
      .then(({ data }) => {
        login(data.user, data.accessToken, data.refreshToken);
        navigate("/dashboard", { replace: true });
      })
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Verification failed. Please log in again.",
        ),
      );
  }, [token, email, login, navigate]);

  return <AuthStatusCard title="Verifying your sign-in…" error={error} />;
}
