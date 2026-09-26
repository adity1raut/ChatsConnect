import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Mail, MailCheck } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { Alert, AlertDescription, Button, InputField, PasswordField } from "../../components/ui";
import AuthLayout from "./AuthLayout";
import GitHubButton, { OrDivider } from "./GitHubButton";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  // OAuth / 2FA failures redirect here with ?error=...
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => searchParams.get("error") || "");
  const [checkEmail, setCheckEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (data.twoFactorRequired) {
        // No tokens yet — they must open the emailed link
        setCheckEmail(data.message);
      } else {
        login(data.user, data.accessToken, data.refreshToken);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign you in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <AuthLayout title="Check your email" subtitle="Two-step verification is on for this account.">
        <div className="space-y-5 text-center">
          <span className="mx-auto flex size-14 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
            <MailCheck className="size-6" aria-hidden="true" />
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">{checkEmail}</p>
          <Button variant="ghost" onClick={() => setCheckEmail("")}>
            Back to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to ChatsConnect."
      footer={
        <>
          New here?{" "}
          <Link to="/registration" className="font-bold text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <InputField
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && (
          <Alert variant="destructive" className="animate-shake">
            <AlertCircle aria-hidden="true" />
            <AlertDescription className="text-current">{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" fullWidth size="lg" loading={loading} disabled={!email || !password}>
          Sign in
        </Button>
      </form>
      <OrDivider />
      <GitHubButton />
    </AuthLayout>
  );
}
