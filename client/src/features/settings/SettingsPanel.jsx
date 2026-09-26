import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AtSign,
  Bot,
  ChevronDown,
  Info,
  Lock,
  Mail,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
} from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { useAI } from "../../context/AIContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Button,
  Input,
  PasswordInput,
  SegmentedControl,
  Select,
  Toggle,
} from "../../components/ui";
import { cn } from "../../lib/cn";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Dutch",
  "Russian",
  "Japanese",
  "Korean",
  "Chinese",
  "Arabic",
  "Hindi",
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Runs an async form action and exposes loading + a success/error message
function useFormAction() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const run = async (action, successText) => {
    setLoading(true);
    setMessage(null);
    try {
      await action();
      setMessage({ type: "success", text: successText });
      return true;
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Something went wrong",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fail = (text) => setMessage({ type: "error", text });
  return { loading, message, run, fail, clear: () => setMessage(null) };
}

function InlineMessage({ message }) {
  if (!message) return null;
  return (
    <p
      role={message.type === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg px-3 py-2 text-xs font-medium",
        message.type === "error"
          ? "bg-red-500/10 text-red-600 dark:text-red-400"
          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      )}
    >
      {message.text}
    </p>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="space-y-3 border-b border-line pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent-fg">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-fg">{title}</h3>
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ title, description, control }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-1 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg">{title}</p>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      {control}
    </div>
  );
}

function Collapsible({ icon: Icon, title, description, open, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
      >
        <Icon className="size-4 shrink-0 text-muted" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-fg">{title}</span>
          {description && (
            <span className="block truncate text-xs text-muted">{description}</span>
          )}
        </span>
        <ChevronDown
          className={cn("size-4 text-subtle transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && <div className="space-y-3 border-t border-line p-4">{children}</div>}
    </div>
  );
}

function AppearanceSection() {
  const { themeMode, setThemeMode } = useTheme();
  return (
    <Section icon={Palette} title="Appearance" description="How ChatsConnect looks on this device">
      <Row
        title="Theme"
        control={
          <SegmentedControl
            label="Theme"
            options={THEME_OPTIONS}
            value={themeMode}
            onChange={setThemeMode}
            size="sm"
          />
        }
      />
    </Section>
  );
}

function AISection() {
  const {
    aiEnabled,
    setAiEnabled,
    autoTranslate,
    setAutoTranslate,
    preferredLanguage,
    setPreferredLanguage,
  } = useAI();

  return (
    <Section icon={Bot} title="AI assistant" description="Smart replies and translation">
      <Row
        title="AI suggestions"
        description="Show smart reply suggestions for incoming messages"
        control={<Toggle label="AI suggestions" checked={aiEnabled} onChange={setAiEnabled} />}
      />
      <Row
        title="Auto-translate"
        description="Translate received messages into your language"
        control={
          <Toggle label="Auto-translate" checked={autoTranslate} onChange={setAutoTranslate} />
        }
      />
      {autoTranslate && (
        <Select
          label="Translate to"
          options={LANGUAGES}
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value)}
        />
      )}
    </Section>
  );
}

function TwoFactorSetting({ enabled, onChanged }) {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const action = useFormAction();

  const submit = async (e) => {
    e.preventDefault();
    const ok = await action.run(async () => {
      const { data } = await axios.put(`${API_URL}/profile/two-factor`, {
        enabled: !enabled,
        password,
      });
      onChanged(data.twoFactorEnabled);
    }, enabled ? "Two-step verification turned off" : "Two-step verification turned on");
    if (ok) {
      setConfirming(false);
      setPassword("");
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ShieldCheck
            className={cn("size-4 shrink-0", enabled ? "text-emerald-500" : "text-muted")}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-fg">Two-step verification</p>
            <p className="text-xs text-muted">
              {enabled
                ? "On — we email you a sign-in link each time you log in"
                : "Confirm each sign-in with a link sent to your email"}
            </p>
          </div>
        </div>
        <Toggle
          label="Two-step verification"
          checked={enabled}
          onChange={() => {
            setConfirming((v) => !v);
            action.clear();
          }}
        />
      </div>
      {confirming && (
        <form onSubmit={submit} className="space-y-3">
          <PasswordInput
            label={`Enter your password to turn ${enabled ? "off" : "on"}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            data-autofocus
            required
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={action.loading}>
              {enabled ? "Turn off" : "Turn on"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setConfirming(false);
                setPassword("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      <InlineMessage message={action.message} />
    </div>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const action = useFormAction();

  const submit = async (e) => {
    e.preventDefault();
    if (next.length < 6) return action.fail("New password must be at least 6 characters");
    if (next !== confirm) return action.fail("New passwords don't match");
    const ok = await action.run(
      () =>
        axios.put(`${API_URL}/auth/change-password`, {
          currentPassword: current,
          newPassword: next,
        }),
      "Password changed",
    );
    if (ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <PasswordInput
        label="Current password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        autoComplete="current-password"
        required
      />
      <PasswordInput
        label="New password"
        hint="At least 6 characters"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        autoComplete="new-password"
        required
      />
      <PasswordInput
        label="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        required
      />
      <InlineMessage message={action.message} />
      <Button type="submit" loading={action.loading} fullWidth>
        Update password
      </Button>
    </form>
  );
}

function ChangeEmailForm({ currentEmail, onUpdated }) {
  const [email, setEmail] = useState("");
  const action = useFormAction();

  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return action.fail("Enter a valid email address");
    const ok = await action.run(async () => {
      const { data } = await axios.put(`${API_URL}/profile/update-email`, { email });
      onUpdated(data.user);
    }, "Email updated");
    if (ok) setEmail("");
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="New email"
        type="email"
        icon={Mail}
        placeholder={currentEmail || "you@example.com"}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
      <InlineMessage message={action.message} />
      <Button type="submit" loading={action.loading} fullWidth>
        Update email
      </Button>
    </form>
  );
}

function ChangeUsernameForm({ currentUsername, onUpdated }) {
  const [username, setUsername] = useState("");
  const action = useFormAction();

  const submit = async (e) => {
    e.preventDefault();
    if (!USERNAME_RE.test(username)) {
      return action.fail("3–20 characters: letters, numbers and underscores");
    }
    const ok = await action.run(async () => {
      const { data } = await axios.put(`${API_URL}/profile/update`, { username });
      onUpdated(data.user);
    }, "Username updated");
    if (ok) setUsername("");
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="New username"
        icon={AtSign}
        placeholder={currentUsername}
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase())}
        autoComplete="username"
        required
      />
      <InlineMessage message={action.message} />
      <Button type="submit" loading={action.loading} fullWidth>
        Update username
      </Button>
    </form>
  );
}

function SecuritySection() {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(null);
  const isLocal = (user?.authProvider ?? "LOCAL") === "LOCAL";
  const toggle = (id) => setOpen((prev) => (prev === id ? null : id));

  return (
    <Section icon={Lock} title="Account & security" description="Sign-in and identity">
      {isLocal ? (
        <TwoFactorSetting
          enabled={Boolean(user?.twoFactorEnabled)}
          onChanged={(twoFactorEnabled) => updateUser({ twoFactorEnabled })}
        />
      ) : (
        <p className="rounded-xl bg-surface-2 px-4 py-3 text-xs text-muted">
          You sign in with GitHub, so your password and two-step verification are
          managed in your GitHub account.
        </p>
      )}
      {isLocal && (
        <Collapsible
          icon={Lock}
          title="Change password"
          open={open === "password"}
          onToggle={() => toggle("password")}
        >
          <ChangePasswordForm />
        </Collapsible>
      )}
      <Collapsible
        icon={Mail}
        title="Change email"
        description={user?.email}
        open={open === "email"}
        onToggle={() => toggle("email")}
      >
        <ChangeEmailForm currentEmail={user?.email} onUpdated={updateUser} />
      </Collapsible>
      <Collapsible
        icon={AtSign}
        title="Change username"
        description={user?.username && `@${user.username}`}
        open={open === "username"}
        onToggle={() => toggle("username")}
      >
        <ChangeUsernameForm currentUsername={user?.username} onUpdated={updateUser} />
      </Collapsible>
    </Section>
  );
}

/**
 * The one settings surface — rendered in the Settings modal and the profile's
 * Settings tab. `onNavigate` lets the modal close when a link is followed.
 */
export default function SettingsPanel({ onNavigate }) {
  return (
    <div className="space-y-6">
      <AppearanceSection />
      <AISection />
      <SecuritySection />
      <Section icon={Info} title="About" description="Version, stack and credits">
        <Link
          to="/about"
          onClick={onNavigate}
          className="inline-flex text-sm font-semibold text-accent-fg hover:underline"
        >
          About ChatsConnect →
        </Link>
      </Section>
    </div>
  );
}
