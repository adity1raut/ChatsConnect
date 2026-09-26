import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, AtSign, Check, Mail, User } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { Button, InputField, PasswordField } from "../../components/ui";
import { cn } from "../../lib/utils";
import AuthLayout from "./AuthLayout";
import GitHubButton, { OrDivider } from "./GitHubButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const RESEND_COOLDOWN_S = 30;
const STEPS = ["Your details", "Password", "Verify email"];

function StepIndicator({ step }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Sign-up progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const current = step === n;
        return (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={current ? "step" : undefined}>
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                done && "bg-emerald-500 text-white",
                current && "bg-primary text-white",
                !done && !current && "bg-muted text-faint",
              )}
            >
              {done ? <Check className="size-4" aria-hidden="true" /> : n}
            </span>
            <span className={cn("hidden text-xs font-medium sm:block", current ? "text-foreground" : "text-faint")}>{label}</span>
            {n < STEPS.length && <span className={cn("h-0.5 flex-1 rounded-full", done ? "bg-emerald-500" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirm: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const call = async (fn) => {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitDetails = (e) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your name");
    if (!USERNAME_RE.test(form.username)) return setError("Username: 3–20 letters, numbers or underscores");
    if (!EMAIL_RE.test(form.email)) return setError("Please enter a valid email address");
    setStep(2);
  };

  const submitPassword = (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm) return setError("Passwords don't match");
    call(async () => {
      await axios.post(`${API_URL}/auth/request-otp`, {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setStep(3);
      setCooldown(RESEND_COOLDOWN_S);
      setNotice(`We sent a 6-digit code to ${form.email}.`);
    });
  };

  const submitCode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(form.otp)) return setError("Enter the 6-digit code from the email");
    call(async () => {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { email: form.email, otp: form.otp });
      login(data.user, data.accessToken, data.refreshToken);
      navigate("/dashboard");
    });
  };

  const resend = () =>
    call(async () => {
      await axios.post(`${API_URL}/auth/resend-otp`, { email: form.email });
      setCooldown(RESEND_COOLDOWN_S);
      setNotice("A new code is on its way.");
    });

  const back = () => {
    setError("");
    setNotice("");
    setStep((s) => s - 1);
  };

  const messages = (
    <>
      {notice && <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>}
      {error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 animate-shake dark:text-red-300">
          {error}
        </p>
      )}
    </>
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <StepIndicator step={step} />

      {step === 1 && (
        <>
          <form onSubmit={submitDetails} className="space-y-4" noValidate>
            <InputField label="Name" icon={User} value={form.name} onChange={set("name")} autoComplete="name" placeholder="Your name" required />
            <InputField
              label="Username"
              icon={AtSign}
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
              autoComplete="username"
              placeholder="yourname"
              hint="3–20 letters, numbers or underscores"
              required
            />
            <InputField label="Email" type="email" icon={Mail} value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" required />
            {messages}
            <Button type="submit" fullWidth size="lg">
              Continue
            </Button>
          </form>
          <OrDivider />
          <GitHubButton label="Sign up with GitHub" />
        </>
      )}

      {step === 2 && (
        <form onSubmit={submitPassword} className="space-y-4" noValidate>
          <PasswordField label="Password" value={form.password} onChange={set("password")} autoComplete="new-password" hint="At least 6 characters" required />
          <PasswordField label="Confirm password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" required />
          {messages}
          <div className="flex gap-2">
            <Button variant="ghost" icon={ArrowLeft} onClick={back}>
              Back
            </Button>
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Send verification code
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={submitCode} className="space-y-4" noValidate>
          <InputField
            label="Verification code"
            value={form.otp}
            onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            className="text-center font-mono text-xl tracking-[0.5em]"
            data-autofocus
            required
          />
          {messages}
          <Button type="submit" fullWidth size="lg" loading={loading} disabled={form.otp.length !== 6}>
            Create account
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={back} className="font-medium text-muted-foreground hover:text-foreground">
              Change details
            </button>
            <button
              type="button"
              onClick={resend}
              disabled={cooldown > 0 || loading}
              className="font-semibold text-primary hover:underline disabled:text-faint disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
