import { AlertTriangle, LockOpen, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui";
import { cn } from "../../lib/utils";

const TONES = {
  info: "border-border bg-muted text-muted-foreground",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
};

/**
 * Explains the encryption state of the open DM and offers the next step.
 * `state`: "setup" | "locked" | "peer-missing" | "key-changed" | null
 */
export default function EncryptionBanner({ state, peerName, onSetup, onUnlock, onVerify }) {
  if (!state) return null;

  const content = {
    setup: {
      tone: "info",
      icon: LockOpen,
      text: `Messages with ${peerName} aren't end-to-end encrypted yet.`,
      action: { label: "Turn on encryption", onClick: onSetup },
    },
    locked: {
      tone: "warn",
      icon: ShieldAlert,
      text: "Unlock encryption on this device to read and send encrypted messages.",
      action: { label: "Unlock", onClick: onUnlock },
    },
    "peer-missing": {
      tone: "info",
      icon: LockOpen,
      text: `${peerName} hasn't turned on encryption yet, so these messages aren't end-to-end encrypted.`,
    },
    "key-changed": {
      tone: "warn",
      icon: AlertTriangle,
      text: `${peerName}'s security code changed. Verify it if you weren't expecting this.`,
      action: { label: "Verify", onClick: onVerify },
    },
  }[state];

  const Icon = content.icon;
  return (
    <div
      role="status"
      className={cn(
        "flex shrink-0 items-center gap-3 border-b px-4 py-2 text-xs",
        TONES[content.tone],
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">{content.text}</p>
      {content.action && (
        <Button size="sm" variant="outline" onClick={content.action.onClick}>
          {content.action.label}
        </Button>
      )}
    </div>
  );
}
