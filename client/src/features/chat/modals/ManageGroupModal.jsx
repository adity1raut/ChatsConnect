import { useEffect, useState } from "react";
import { Crown, LogOut, UserMinus, UserPlus } from "lucide-react";
import axios from "../../../config/axiosInstance.js";
import { API_URL } from "../../../config/api.js";
import { useSocket } from "../../../context/SocketContext";
import {
  Avatar,
  Badge,
  Button,
  IconButton,
  Modal,
  Spinner,
} from "../../../components/ui";
import { toast } from "../../../lib/toast";
import UserPicker from "./UserPicker";

const memberId = (m) => m.user?._id ?? m.user;

export default function ManageGroupModal({ group, currentUser, onClose, onGroupUpdated, onLeft }) {
  const { onlineUsers } = useSocket();
  const groupId = group.groupId || group.id;
  const [details, setDetails] = useState(null); // { members } | { error }
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_URL}/groups/${groupId}`)
      .then(({ data }) => !cancelled && setDetails({ members: data.group?.members ?? [] }))
      .catch(() => !cancelled && setDetails({ error: "Couldn't load this group" }));
    return () => {
      cancelled = true;
    };
  }, [groupId, reloadKey]);

  const members = details?.members ?? [];
  const me = members.find((m) => memberId(m) === currentUser?._id);
  const isAdmin = me?.role === "admin";
  const memberIds = new Set(members.map(memberId));

  const run = async (label, action, success) => {
    setBusy(label);
    try {
      await action();
      if (success) toast({ title: success });
      setReloadKey((k) => k + 1);
      onGroupUpdated?.();
      return true;
    } catch (err) {
      toast({ title: "Something went wrong", description: err.response?.data?.message, variant: "error" });
      return false;
    } finally {
      setBusy("");
    }
  };

  const addMember = (user) =>
    run(
      `add-${user._id}`,
      // The API expects `memberIds` (the old modal sent `userIds`, so adding never worked)
      () => axios.post(`${API_URL}/groups/${groupId}/members`, { memberIds: [user._id] }),
      `${user.name} added`,
    );

  const removeMember = (m) =>
    run(`remove-${memberId(m)}`, () => axios.delete(`${API_URL}/groups/${groupId}/members/${memberId(m)}`), `${m.user?.name ?? "Member"} removed`);

  const leave = async () => {
    const ok = await run("leave", () => axios.delete(`${API_URL}/groups/${groupId}/leave`), `You left ${group.name}`);
    if (ok) {
      onLeft?.();
      onClose();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={group.name}
      description={details?.members ? `${members.length} member${members.length === 1 ? "" : "s"}` : undefined}
      size="md"
      footer={
        <Button variant="danger-soft" icon={LogOut} onClick={() => setConfirmLeave(true)}>
          Leave group
        </Button>
      }
    >
      {!details ? (
        <div className="flex justify-center py-10">
          <Spinner label="Loading group" />
        </div>
      ) : details.error ? (
        <p className="py-6 text-center text-sm text-red-600 dark:text-red-400">{details.error}</p>
      ) : (
        <div className="space-y-4">
          {isAdmin && (
            adding ? (
              <div className="space-y-2">
                <UserPicker excludeIds={memberIds} onPick={addMember} placeholder="Search people to add" />
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                  Done adding
                </Button>
              </div>
            ) : (
              <Button variant="secondary" icon={UserPlus} fullWidth onClick={() => setAdding(true)}>
                Add people
              </Button>
            )
          )}

          <ul className="divide-y divide-line rounded-xl border border-line">
            {members.map((m) => {
              const id = memberId(m);
              const isMe = id === currentUser?._id;
              return (
                <li key={id} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar src={m.user?.avatar} name={m.user?.name ?? "Member"} size="sm" online={onlineUsers.has(id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {m.user?.name ?? "Deleted account"}
                      {isMe && <span className="font-normal text-muted"> (you)</span>}
                    </span>
                    {m.user?.username && <span className="block truncate text-xs text-muted">@{m.user.username}</span>}
                  </span>
                  {m.role === "admin" && (
                    <Badge variant="accent" icon={Crown}>
                      Admin
                    </Badge>
                  )}
                  {isAdmin && !isMe && (
                    <IconButton
                      icon={UserMinus}
                      label={`Remove ${m.user?.name ?? "member"}`}
                      size="sm"
                      variant="danger"
                      disabled={busy === `remove-${id}`}
                      onClick={() => removeMember(m)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Modal
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        title={`Leave ${group.name}?`}
        description={isAdmin && members.filter((m) => m.role === "admin").length === 1 ? "You're the only admin — someone else will become admin." : "You'll stop getting its messages."}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmLeave(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy === "leave"} onClick={leave}>
              Leave
            </Button>
          </>
        }
      />
    </Modal>
  );
}
