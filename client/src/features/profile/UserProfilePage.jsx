import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
  Video,
} from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { useFriends } from "../../context/FriendContext";
import { useSocket } from "../../context/SocketContext";
import { useCall } from "../../context/CallContext";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  IconButton,
  Modal,
  Spinner,
} from "../../components/ui";
import { toast } from "../../lib/toast";
import ProfileHeader from "./ProfileHeader";

function FriendAction({ userId, name }) {
  const {
    getRelationship,
    incomingRequests,
    sentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeFriend,
  } = useFriends();
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const status = getRelationship(userId).status;

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err.response?.data?.message,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const incoming = incomingRequests.find((r) => r.sender?._id === userId);
  const sent = sentRequests.find((r) => r.receiver?._id === userId);

  if (status === "friends") {
    return (
      <>
        <Button variant="secondary" icon={UserCheck} onClick={() => setConfirmRemove(true)}>
          Friends
        </Button>
        <Modal
          open={confirmRemove}
          onClose={() => setConfirmRemove(false)}
          title={`Remove ${name} from friends?`}
          description="You can send a new request later."
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmRemove(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={UserMinus}
                loading={busy}
                onClick={() =>
                  run(() => removeFriend(userId)).then(() => setConfirmRemove(false))
                }
              >
                Remove friend
              </Button>
            </>
          }
        />
      </>
    );
  }
  if (status === "received" && incoming) {
    return (
      <>
        <Button
          icon={UserCheck}
          loading={busy}
          onClick={() => run(() => acceptRequest(incoming._id, userId))}
        >
          Accept
        </Button>
        <Button
          variant="secondary"
          icon={UserX}
          disabled={busy}
          onClick={() => run(() => rejectRequest(incoming._id, userId))}
        >
          Decline
        </Button>
      </>
    );
  }
  if (status === "sent" && sent) {
    return (
      <Button
        variant="secondary"
        loading={busy}
        onClick={() => run(() => cancelRequest(sent._id, userId))}
      >
        Cancel request
      </Button>
    );
  }
  return (
    <Button icon={UserPlus} loading={busy} onClick={() => run(() => sendRequest(userId))}>
      Add friend
    </Button>
  );
}

function MutualList({ title, count, children }) {
  if (!count) return null;
  return (
    <Card>
      <h2 className="mb-3 text-sm font-bold">
        {title} <span className="font-normal text-muted">({count})</span>
      </h2>
      {children}
    </Card>
  );
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const { onlineUsers } = useSocket();
  const { startCall } = useCall();
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_URL}/profile/${userId}`)
      .then(({ data }) => !cancelled && setState({ status: "ready", ...data }))
      .catch(() => !cancelled && setState({ status: "missing" }));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (me?._id === userId) return <Navigate to="/profile" replace />;

  if (state.status === "loading") {
    return (
      <div className="flex h-full min-h-[60dvh] items-center justify-center">
        <Spinner label="Loading profile" className="size-8" />
      </div>
    );
  }

  if (state.status === "missing") {
    return (
      <EmptyState
        icon={Users}
        title="User not found"
        description="This account may have been deleted."
        action={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go back
          </Button>
        }
        className="min-h-[60dvh]"
      />
    );
  }

  const { user, friendCount, mutualFriends, mutualGroups } = state;
  const chat = {
    id: user._id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
        Back
      </Button>

      <ProfileHeader
        user={user}
        online={onlineUsers.has(user._id)}
        stats={[
          { label: "Friends", value: friendCount },
          { label: "Mutual friends", value: mutualFriends.count },
        ]}
        actions={
          <>
            <Button
              icon={MessageCircle}
              aria-label="Message"
              onClick={() => navigate("/chat", { state: { openChat: chat } })}
            >
              {/* Icon-only on narrow phones so all actions fit on one row */}
              <span className="hidden xs:inline">Message</span>
            </Button>
            <FriendAction userId={user._id} name={user.name} />
            <div className="flex gap-2">
              <IconButton
                icon={Phone}
                label={`Voice call ${user.name}`}
                variant="soft"
                onClick={() => startCall(chat, true)}
              />
              <IconButton
                icon={Video}
                label={`Video call ${user.name}`}
                variant="soft"
                onClick={() => startCall(chat, false)}
              />
            </div>
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <MutualList title="Mutual friends" count={mutualFriends.count}>
          <ul className="space-y-2">
            {mutualFriends.users.map((f) => (
              <li key={f._id}>
                <Link
                  to={`/profile/${f._id}`}
                  className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-surface-2"
                >
                  <Avatar src={f.avatar} name={f.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{f.name}</span>
                    <span className="block truncate text-xs text-muted">@{f.username}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </MutualList>
        <MutualList title="Groups in common" count={mutualGroups.count}>
          <ul className="space-y-2">
            {mutualGroups.groups.map((g) => (
              <li key={g._id}>
                <Link
                  to="/chat"
                  state={{ openGroup: { groupId: g._id } }}
                  className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-surface-2"
                >
                  <Avatar src={g.avatar} name={g.name} size="sm" shape="square" />
                  <span className="truncate text-sm font-semibold">{g.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </MutualList>
      </div>
    </div>
  );
}
