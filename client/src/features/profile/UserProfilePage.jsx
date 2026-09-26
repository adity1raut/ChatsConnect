import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Users,
  Video,
} from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useCall } from "../../context/CallContext";
import { Button, Card, EmptyState, IconButton, Skeleton, UserAvatar } from "../../components/ui";
import ProfileHeader from "./ProfileHeader";
import FriendAction from "./FriendAction";

function MutualList({ title, count, children }) {
  if (!count) return null;
  return (
    <Card>
      <h2 className="eyebrow flex items-center justify-between border-b border-border px-5 py-3 text-primary">
        {title}
        <span className="text-faint tabular-nums">[{String(count).padStart(2, "0")}]</span>
      </h2>
      <div className="p-2">{children}</div>
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
      <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8 sm:px-8 sm:py-10" aria-busy="true">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-80 w-full" />
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
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
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
    <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8 sm:px-8 sm:py-10">
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
                variant="secondary"
                onClick={() => startCall(chat, true)}
              />
              <IconButton
                icon={Video}
                label={`Video call ${user.name}`}
                variant="secondary"
                onClick={() => startCall(chat, false)}
              />
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <MutualList title="Mutual friends" count={mutualFriends.count}>
          <ul className="space-y-1">
            {mutualFriends.users.map((f) => (
              <li key={f._id}>
                <Link
                  to={`/profile/${f._id}`}
                  className="flex items-center gap-3 border border-transparent p-2 hover:border-border hover:bg-accent"
                >
                  <UserAvatar src={f.avatar} name={f.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">{f.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">@{f.username}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </MutualList>
        <MutualList title="Groups in common" count={mutualGroups.count}>
          <ul className="space-y-1">
            {mutualGroups.groups.map((g) => (
              <li key={g._id}>
                <Link
                  to="/chat"
                  state={{ openGroup: { groupId: g._id } }}
                  className="flex items-center gap-3 border border-transparent p-2 hover:border-border hover:bg-accent"
                >
                  <UserAvatar src={g.avatar} name={g.name} size="sm" />
                  <span className="truncate text-xs font-bold">{g.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </MutualList>
      </div>
    </div>
  );
}
