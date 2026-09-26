import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useE2EE } from "../../context/E2EEContext";
import { Button, Modal, Spinner } from "../../components/ui";
import { safetyNumber } from "./crypto";

// Compare this code with the other person (in person or on a call). If it
// matches, nobody — including the server — is intercepting your messages.
export default function SecurityCodeModal({ open, onClose, peer }) {
  const { fingerprint, getPeerKeys, changedPeers, acknowledgeKeyChange } = useE2EE();
  const [code, setCode] = useState(null);

  useEffect(() => {
    if (!open || !peer || !fingerprint) return;
    let cancelled = false;
    getPeerKeys(peer.id)
      .then((keys) => (keys.hasKey ? safetyNumber(fingerprint, keys.fingerprint) : null))
      .then((value) => !cancelled && setCode(value ?? "unavailable"))
      .catch(() => !cancelled && setCode("unavailable"));
    return () => {
      cancelled = true;
      setCode(null);
    };
  }, [open, peer, fingerprint, getPeerKeys]);

  const changed = peer && changedPeers.has(peer.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verify security code"
      description={peer ? `Your encrypted chat with ${peer.name}` : undefined}
      size="sm"
      footer={
        changed ? (
          <Button
            icon={ShieldCheck}
            onClick={async () => {
              await acknowledgeKeyChange(peer.id);
              onClose();
            }}
          >
            I've verified the new code
          </Button>
        ) : (
          <Button onClick={onClose}>Done</Button>
        )
      }
    >
      {code === null ? (
        <div className="flex justify-center py-8">
          <Spinner label="Computing security code" />
        </div>
      ) : code === "unavailable" ? (
        <p className="text-sm text-muted">
          A security code is available once both of you have turned on encryption.
        </p>
      ) : (
        <div className="space-y-4">
          <p
            className="grid grid-cols-4 gap-x-4 gap-y-2 rounded-xl bg-surface-2 p-4 text-center font-mono text-lg font-semibold tracking-wider"
            aria-label={`Security code ${code}`}
          >
            {code.split(" ").map((group, i) => (
              <span key={i}>{group}</span>
            ))}
          </p>
          <p className="text-sm text-muted">
            Ask {peer.name} to open this screen and compare the numbers — in person or on a call.
            If they match, your messages are end-to-end encrypted with nobody in between.
          </p>
          {changed && (
            <p className="rounded-xl bg-amber-500/15 p-3 text-sm text-amber-800 dark:text-amber-200">
              {peer.name}&apos;s security code changed recently. That's normal if they reset their
              keys or changed devices — confirm the new code with them.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
