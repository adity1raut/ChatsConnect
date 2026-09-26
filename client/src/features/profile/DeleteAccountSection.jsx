import { useState } from "react";
import { AlertCircle, AlertTriangle, Trash2 } from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { Alert, AlertDescription, Button, Card, InputField, Modal, PasswordField } from "../../components/ui";

const CONFIRM_WORD = "DELETE";

export default function DeleteAccountSection() {
  const { user, logout } = useAuth();
  const isLocal = (user?.authProvider ?? "LOCAL") === "LOCAL";
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setOpen(false);
    setConfirmText("");
    setPassword("");
    setError("");
  };

  const canDelete = confirmText === CONFIRM_WORD && (!isLocal || password);

  const deleteAccount = async (e) => {
    e.preventDefault();
    if (!canDelete) return;
    setDeleting(true);
    setError("");
    try {
      await axios.delete(`${API_URL}/profile/delete`, {
        data: isLocal ? { password } : {},
      });
      logout();
      window.location.assign("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete your account");
      setDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/40">
      <div className="flex items-center justify-between border-b border-destructive/30 bg-destructive/[0.05] px-5 py-3">
        <h2 className="eyebrow text-destructive">Danger zone</h2>
        <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
      </div>
      <div className="flex items-start gap-3 p-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold tracking-[0.12em] uppercase">Delete account</h3>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Permanently deletes your profile, friends, group memberships and
            notifications. Messages you sent stay in other people's chats. This
            can't be undone.
          </p>
          <Button
            variant="destructive"
            icon={Trash2}
            className="mt-4"
            onClick={() => setOpen(true)}
          >
            Delete my account
          </Button>
        </div>
      </div>

      <Modal
        open={open}
        onClose={close}
        title="Delete your account?"
        description="This is permanent."
        size="sm"
      >
        <form onSubmit={deleteAccount} className="space-y-4">
          {isLocal && (
            <PasswordField
              label="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              data-autofocus
              required
            />
          )}
          <InputField
            label={`Type ${CONFIRM_WORD} to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {error && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription className="text-current">{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" loading={deleting} disabled={!canDelete}>
              Delete forever
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
