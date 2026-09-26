import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useE2EE } from "../../context/E2EEContext";
import { Alert, AlertDescription, Button, Corners, Modal, Spinner } from "../../components/ui";
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
        <p className="text-xs leading-relaxed text-muted-foreground">
          A security code is available once both of you have turned on encryption.
        </p>
      ) : (
        <div className="space-y-4">
          <p
            className="relative grid grid-cols-4 gap-x-4 gap-y-2 border border-primary/35 bg-primary/[0.05] p-4 text-center text-base font-bold tracking-[0.12em] text-primary tabular-nums"
            aria-label={`Security code ${code}`}
          >
            <Corners />
            {code.split(" ").map((group, i) => (
              <span key={i}>{group}</span>
            ))}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Ask {peer.name} to open this screen and compare the numbers — in person or on a call.
            If they match, your messages are end-to-end encrypted with nobody in between.
          </p>
          {changed && (
            <Alert variant="warning" role="status">
              <AlertTriangle aria-hidden="true" />
              <AlertDescription className="text-current">
                {peer.name}&apos;s security code changed recently. That&apos;s normal if they reset their keys or
                changed devices — confirm the new code with them.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Modal>
  );
}
