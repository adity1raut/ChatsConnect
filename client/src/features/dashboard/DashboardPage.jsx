import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Lock,
  LockOpen,
  MessageSquare,
  MessagesSquare,
  Search,
  SquarePen,
  UserPlus,
  Users,
  UsersRound,
  Wifi,
} from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useAI } from "../../context/AIContext";
import { useE2EE } from "../../context/E2EEContext";
import { useFriends } from "../../context/FriendContext";
import { useSettingsModal } from "../../context/SettingsModalContext";
import { Avatar, Button, Card, EmptyState, Spinner } from "../../components/ui";
import { cn } from "../../lib/cn";
import { timeAgo } from "../../lib/time";

const greeting = (hour = new Date().getHours()) =>
  hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tint)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold tabular-nums">{value ?? "–"}</p>
        <p className="truncate text-xs text-muted">{label}</p>
      </div>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-sm font-semibold transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-fg"
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </button>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { assistant } = useAI();
  const e2ee = useE2EE();
  const { incomingRequests } = useFriends();
  const { openSettings } = useSettingsModal();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_URL}/dashboard/stats`)
      .then(({ data: d }) => !cancelled && setData(d))
      .catch(() => !cancelled && setData({ stats: {}, recentActivity: [], error: true }));
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep counts and activity live while the page is open
  useEffect(() => {
    if (!socket || !user) return;
    const onMessage = ({ message, groupId }) => {
      const sender = message.senderId;
      if (!sender || sender._id === user._id) return;
      setData((prev) =>
        prev && {
          ...prev,
          stats: { ...prev.stats, totalMessages: (prev.stats.totalMessages ?? 0) + 1 },
          recentActivity: [
            {
              id: message._id,
              user: sender.name,
              userId: sender._id,
              username: sender.username,
              avatar: sender.avatar,
              action: groupId ? "sent a message in a group" : "sent you a message",
              time: message.createdAt,
              type: groupId ? "group" : "dm",
              groupId: groupId ?? null,
            },
            ...prev.recentActivity,
          ].slice(0, 5),
        },
      );
    };
    socket.on("newMessage", onMessage);
    socket.on("newGroupMessage", onMessage);
    return () => {
      socket.off("newMessage", onMessage);
      socket.off("newGroupMessage", onMessage);
    };
  }, [socket, user]);

  const openActivity = (a) =>
    a.type === "group" && a.groupId
      ? navigate("/chat", { state: { openGroup: { groupId: a.groupId } } })
      : a.userId
        ? navigate("/chat", {
            state: { openChat: { id: a.userId, name: a.user, username: a.username, avatar: a.avatar } },
          })
        : navigate("/chat");

  const stats = data?.stats ?? {};
  const firstName = user?.name?.split(" ")[0] ?? "";
  const encryptionOn = e2ee.status === "ready";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <p className="text-sm text-muted">
          {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {greeting()}, {firstName} 👋
        </h1>
      </header>

      <section aria-label="Your stats" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={MessageSquare} label="Messages" value={stats.totalMessages} tint="bg-sky-500/12 text-sky-600 dark:text-sky-400" />
        <StatCard icon={MessagesSquare} label="Conversations" value={stats.conversations} tint="bg-violet-500/12 text-violet-600 dark:text-violet-400" />
        <StatCard icon={Users} label="Groups" value={stats.groups} tint="bg-amber-500/15 text-amber-700 dark:text-amber-400" />
        <StatCard icon={Wifi} label="Online now" value={stats.activeUsers} tint="bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" />
      </section>

      <section aria-label="Quick actions" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction icon={SquarePen} label="New message" onClick={() => navigate("/chat", { state: { newChat: true } })} />
        <QuickAction icon={UsersRound} label="New group" onClick={() => navigate("/chat", { state: { newGroup: true } })} />
        <QuickAction icon={Search} label="Find people" onClick={() => navigate("/search")} />
        <QuickAction icon={MessageSquare} label={`Ask ${assistant?.name ?? "AI"}`} onClick={() => navigate("/assistant")} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="font-bold">Recent activity</h2>
            <Link to="/chat" className="inline-flex items-center gap-1 text-xs font-semibold text-accent-fg hover:underline">
              All chats <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          {!data ? (
            <div className="flex justify-center py-12">
              <Spinner label="Loading activity" />
            </div>
          ) : data.recentActivity.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={data.error ? "Couldn't load activity" : "No activity yet"}
              description={data.error ? "Try again in a moment." : "Messages people send you will show up here."}
            />
          ) : (
            <ul className="divide-y divide-line">
              {data.recentActivity.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => openActivity(a)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-2"
                  >
                    <Avatar src={a.avatar} name={a.user} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">
                        <span className="font-semibold">{a.user}</span> <span className="text-muted">{a.action}</span>
                      </span>
                      <span className="text-xs text-subtle">{timeAgo(a.time)}</span>
                    </span>
                    {a.encrypted && <Lock className="size-3.5 text-subtle" aria-label="End-to-end encrypted" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-2xl shadow-md">
                {assistant?.avatar ?? "🤖"}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-bold">{assistant?.name ?? "Your assistant"}</h2>
                <p className="text-xs text-muted">Your personal AI assistant</p>
              </div>
            </div>
            <p className="text-sm text-muted">
              Draft messages, summarize chats, look people up — in your assistant&apos;s own style.
            </p>
            <Button fullWidth iconRight={ArrowRight} onClick={() => navigate("/assistant")}>
              Open assistant
            </Button>
          </Card>

          <Card className="space-y-2">
            <div className="flex items-center gap-2">
              {encryptionOn ? (
                <Lock className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              ) : (
                <LockOpen className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              )}
              <h2 className="text-sm font-bold">End-to-end encryption</h2>
            </div>
            <p className="text-sm text-muted">
              {encryptionOn
                ? "On — your direct messages are readable only by you and the people you talk to."
                : e2ee.status === "locked"
                  ? "Locked on this device. Unlock it to read your encrypted messages here."
                  : "Off — turn it on so only you and your contacts can read your direct messages."}
            </p>
            {!encryptionOn && (
              <Button size="sm" variant="secondary" onClick={openSettings}>
                {e2ee.status === "locked" ? "Unlock" : "Turn on"}
              </Button>
            )}
          </Card>

          {incomingRequests.length > 0 && (
            <Card as={Link} to="/notifications" interactive className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-fg">
                <UserPlus className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">
                  {incomingRequests.length} friend request{incomingRequests.length === 1 ? "" : "s"}
                </span>
                <span className="block text-xs text-muted">Review them in Notifications</span>
              </span>
              <ArrowRight className="size-4 text-subtle" aria-hidden="true" />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
