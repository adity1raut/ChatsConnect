import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AtSign,
  Bell,
  Bot,
  ChevronDown,
  Info,
  KeyRound,
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
import { useNotifications } from "../../context/NotificationContext";
import { useE2EE } from "../../context/E2EEContext";
import EncryptionModal from "../e2ee/EncryptionModal";
import AssistantSettingsModal from "../ai/AssistantSettingsModal";
import { Button, InputField, PasswordField, SegmentedControl, SelectField, Switch } from "../../components/ui";
import { cn } from "../../lib/utils";
import { LANGUAGES } from "../../lib/languages";


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
    <section className="space-y-3 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
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
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {control}
    </div>
  );
}

function Collapsible({ icon: Icon, title, description, open, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          {description && (
            <span className="block truncate text-xs text-muted-foreground">{description}</span>
          )}
        </span>
        <ChevronDown
          className={cn("size-4 text-faint transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && <div className="space-y-3 border-t border-border p-4">{children}</div>}
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
  const [customizing, setCustomizing] = useState(false);
  const {
    assistant,
    aiEnabled,
    setAiEnabled,
    autoTranslate,
    setAutoTranslate,
    preferredLanguage,
    setPreferredLanguage,
  } = useAI();

  return (
    <Section icon={Bot} title="AI assistant" description="Your assistant, smart replies and translation">
      <Row
        title={`${assistant?.avatar ?? "🤖"} ${assistant?.name ?? "Your assistant"}`}
        description="Name, personality, tone, answer length and instructions"
        control={
          <Button size="sm" variant="outline" onClick={() => setCustomizing(true)}>
            Customize
          </Button>
        }
      />
      {customizing && <AssistantSettingsModal onClose={() => setCustomizing(false)} />}
      <Row
        title="AI suggestions"
        description="Show smart reply suggestions for incoming messages"
        control={<Switch aria-label="AI suggestions" checked={aiEnabled} onCheckedChange={setAiEnabled} />}
      />
      <Row
        title="Auto-translate"
        description="Translate received messages into your language"
        control={
          <Switch aria-label="Auto-translate" checked={autoTranslate} onCheckedChange={setAutoTranslate} />
        }
      />
      {autoTranslate && (
        <SelectField
          label="Translate to"
          options={LANGUAGES}
          value={preferredLanguage}
          onValueChange={setPreferredLanguage}
        />
      )}
    </Section>
  );
}

const NOTIFICATION_TYPES = [
  { key: "messages", title: "Direct messages" },
  { key: "groupMessages", title: "Group messages" },
  { key: "friendRequests", title: "Friend requests" },
  { key: "groups", title: "Added to a group" },
  { key: "calls", title: "Missed calls" },
];

function NotificationsSection() {
  const {
    preferences,
    updatePreference,
    devicePrefs,
    setDevicePref,
    desktopPermission,
  } = useNotifications();

  const desktopHint =
    desktopPermission === "unsupported"
      ? "Not supported in this browser"
      : desktopPermission === "denied"
        ? "Blocked — allow notifications for this site in your browser settings"
        : "Show alerts when ChatsConnect is in the background";

  return (
    <Section icon={Bell} title="Notifications" description="What notifies you, and how">
      {NOTIFICATION_TYPES.map(({ key, title }) => (
        <Row
          key={key}
          title={title}
          control={
            <Switch
              aria-label={title}
              checked={preferences?.[key] ?? true}
              disabled={!preferences}
              onCheckedChange={(value) => updatePreference(key, value)}
            />
          }
        />
      ))}
      <div className="my-1 h-px bg-border" />
      <Row
        title="Sound"
        description="Play a chime on this device"
        control={
          <Switch
            aria-label="Sound"
            checked={devicePrefs.sound}
            onCheckedChange={(value) => setDevicePref("sound", value)}
          />
        }
      />
      <Row
        title="Desktop notifications"
        description={desktopHint}
        control={
          <Switch
            aria-label="Desktop notifications"
            checked={devicePrefs.desktop && desktopPermission === "granted"}
            disabled={desktopPermission === "unsupported" || desktopPermission === "denied"}
            onCheckedChange={(value) => setDevicePref("desktop", value)}
          />
        }
      />
    </Section>
  );
}

const groupFingerprint = (fp) => fp?.match(/.{1,4}/g)?.join(" ") ?? "";

function EncryptionSection() {
  const { status, fingerprint } = useE2EE();
  const [modal, setModal] = useState(null);

  const summary = {
    none: "Off — direct messages aren't end-to-end encrypted yet.",
    locked: "On, but locked on this device. Unlock with your passphrase to read encrypted messages here.",
    ready: "On — direct messages are readable only by you and the other person.",
    error: "Couldn't load your encryption status. Try again later.",
  }[status] ?? "Checking…";

  return (
    <Section icon={KeyRound} title="End-to-end encryption" description="Direct messages only; group chats aren't encrypted">
      <p className="text-sm text-muted-foreground">{summary}</p>
      {status === "ready" && fingerprint && (
        <p className="rounded-xl bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
          Your key: {groupFingerprint(fingerprint)}
        </p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {status === "none" && (
          <Button size="sm" icon={Lock} onClick={() => setModal("setup")}>
            Turn on encryption
          </Button>
        )}
        {status === "locked" && (
          <>
            <Button size="sm" icon={KeyRound} onClick={() => setModal("unlock")}>
              Unlock
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setModal("reset")}>
              Forgot passphrase
            </Button>
          </>
        )}
        {status === "ready" && (
          <>
            <Button size="sm" variant="outline" onClick={() => setModal("change")}>
              Change passphrase
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setModal("reset")}>
              Reset keys
            </Button>
          </>
        )}
      </div>
      {modal && <EncryptionModal key={modal} open mode={modal} onClose={() => setModal(null)} />}
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
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ShieldCheck
            className={cn("size-4 shrink-0", enabled ? "text-emerald-500" : "text-muted-foreground")}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Two-step verification</p>
            <p className="text-xs text-muted-foreground">
              {enabled
                ? "On — we email you a sign-in link each time you log in"
                : "Confirm each sign-in with a link sent to your email"}
            </p>
          </div>
        </div>
        <Switch
          aria-label="Two-step verification"
          checked={enabled}
          onCheckedChange={() => {
            setConfirming((v) => !v);
            action.clear();
          }}
        />
      </div>
      {confirming && (
        <form onSubmit={submit} className="space-y-3">
          <PasswordField
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
      <PasswordField
        label="Current password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        autoComplete="current-password"
        required
      />
      <PasswordField
        label="New password"
        hint="At least 6 characters"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        autoComplete="new-password"
        required
      />
      <PasswordField
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
      <InputField
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
      <InputField
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
        <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
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
      <NotificationsSection />
      <EncryptionSection />
      <SecuritySection />
      <Section icon={Info} title="About" description="Version, stack and credits">
        <Link
          to="/about"
          onClick={onNavigate}
          className="inline-flex text-sm font-semibold text-primary hover:underline"
        >
          About ChatsConnect →
        </Link>
      </Section>
    </div>
  );
}
