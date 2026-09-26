import { useState } from "react";
import { AlertCircle, AlertTriangle, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useE2EE } from "../../context/E2EEContext";
import { Alert, AlertDescription, Button, Modal, PasswordField } from "../../components/ui";
import { toast } from "../../lib/toast";
import { WrongPassphraseError } from "./crypto";

const MIN_PASSPHRASE = 8;

const COPY = {
  setup: {
    title: "Turn on end-to-end encryption",
    description: "Direct messages you send will be readable only by you and the other person.",
    submit: "Turn on encryption",
    icon: ShieldCheck,
  },
  unlock: {
    title: "Unlock encrypted messages",
    description: "Enter your encryption passphrase to read and send encrypted messages on this device.",
    submit: "Unlock",
    icon: KeyRound,
  },
  change: {
    title: "Change encryption passphrase",
    description: "Your keys stay the same; only the passphrase that protects the backup changes.",
    submit: "Change passphrase",
    icon: KeyRound,
  },
  reset: {
    title: "Reset encryption keys",
    description: "Creates new keys protected by a new passphrase.",
    submit: "Reset keys",
    icon: AlertTriangle,
  },
};

function strengthOf(p) {
  let score = 0;
  if (p.length >= MIN_PASSPHRASE) score++;
  if (p.length >= 14) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) score++;
  return ["Too short", "Weak", "Okay", "Good", "Strong"][score];
}

export default function EncryptionModal({ open, mode: initialMode, onClose }) {
  const { user } = useAuth();
  const e2ee = useE2EE();
  const [mode, setMode] = useState(initialMode);
  const [fields, setFields] = useState({ current: "", passphrase: "", confirm: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isLocal = (user?.authProvider ?? "LOCAL") === "LOCAL";
  const copy = COPY[mode] ?? COPY.setup;
  const choosingNew = mode !== "unlock";
  const Icon = copy.icon;

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const close = () => {
    setFields({ current: "", passphrase: "", confirm: "", password: "" });
    setError("");
    setMode(initialMode);
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (choosingNew) {
      if (fields.passphrase.length < MIN_PASSPHRASE) {
        return setError(`Use at least ${MIN_PASSPHRASE} characters`);
      }
      if (fields.passphrase !== fields.confirm) {
        return setError("Passphrases don't match");
      }
    }
    setBusy(true);
    try {
      if (mode === "setup") await e2ee.setup(fields.passphrase);
      if (mode === "unlock") await e2ee.unlock(fields.passphrase);
      if (mode === "reset") await e2ee.resetKeys(fields.passphrase, fields.password || undefined);
      if (mode === "change") {
        await e2ee.changePassphrase(fields.current, fields.passphrase, fields.password || undefined);
      }
      toast({
        title:
          mode === "unlock"
            ? "Encrypted messages unlocked"
            : mode === "change"
              ? "Passphrase changed"
              : "End-to-end encryption is on",
        icon: Lock,
      });
      close();
    } catch (err) {
      setError(
        err instanceof WrongPassphraseError
          ? "That passphrase isn't right"
          : err.response?.data?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title={copy.title} description={copy.description} size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-3 border border-primary/35 bg-primary/[0.07] p-3 text-xs leading-relaxed text-primary">
          <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            {mode === "setup" && (
              <>
                <p>Your passphrase protects an encrypted backup of your key, so you can read your messages on other devices.</p>
                <p className="font-semibold">Nobody — including ChatsConnect — can recover it if you forget it.</p>
              </>
            )}
            {mode === "unlock" && <p>This is the passphrase you chose when you turned encryption on.</p>}
            {mode === "change" && <p>You'll use the new passphrase on your other devices from now on.</p>}
            {mode === "reset" && (
              <p className="font-semibold">
                Encrypted messages sent before the reset can't be read afterwards, and the people you
                chat with will see that your security code changed.
              </p>
            )}
          </div>
        </div>

        {mode === "unlock" && (
          <PasswordField
            label="Encryption passphrase"
            value={fields.passphrase}
            onChange={set("passphrase")}
            autoComplete="current-password"
            data-autofocus
            required
          />
        )}
        {mode === "change" && (
          <PasswordField
            label="Current passphrase"
            value={fields.current}
            onChange={set("current")}
            autoComplete="current-password"
            data-autofocus
            required
          />
        )}
        {choosingNew && (
          <>
            <PasswordField
              label={mode === "setup" ? "Passphrase" : "New passphrase"}
              hint={fields.passphrase ? `Strength: ${strengthOf(fields.passphrase)}` : `At least ${MIN_PASSPHRASE} characters — a short sentence works well`}
              value={fields.passphrase}
              onChange={set("passphrase")}
              autoComplete="new-password"
              data-autofocus={mode !== "change" || undefined}
              required
            />
            <PasswordField
              label="Confirm passphrase"
              value={fields.confirm}
              onChange={set("confirm")}
              autoComplete="new-password"
              required
            />
          </>
        )}
        {(mode === "reset" || mode === "change") && isLocal && (
          <PasswordField
            label="Account password"
            hint="Confirms it's really you"
            value={fields.password}
            onChange={set("password")}
            autoComplete="current-password"
            required
          />
        )}

        {error && (
          <Alert variant="destructive" className="animate-shake">
            <AlertCircle aria-hidden="true" />
            <AlertDescription className="text-current">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          {mode === "unlock" ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode("reset");
              }}
              className="text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot your passphrase?
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={close}>
              {mode === "setup" ? "Not now" : "Cancel"}
            </Button>
            <Button type="submit" variant={mode === "reset" ? "destructive" : "default"} loading={busy}>
              {busy && choosingNew ? "Securing your key…" : copy.submit}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
