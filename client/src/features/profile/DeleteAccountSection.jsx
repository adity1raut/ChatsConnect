import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, Input, Modal, PasswordInput } from "../../components/ui";

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
    <Card className="border-red-500/30">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">Delete account</h2>
          <p className="mt-1 text-sm text-muted">
            Permanently deletes your profile, friends, group memberships and
            notifications. Messages you sent stay in other people's chats. This
            can't be undone.
          </p>
          <Button
            variant="danger-soft"
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
            <PasswordInput
              label="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              data-autofocus
              required
            />
          )}
          <Input
            label={`Type ${CONFIRM_WORD} to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={deleting} disabled={!canDelete}>
              Delete forever
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
