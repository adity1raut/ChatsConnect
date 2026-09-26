import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  Corners,
  EmptyState,
  PageHeader,
  Skeleton,
  UserAvatar,
} from "../../components/ui";
import { cn } from "../../lib/utils";
import { timeAgo } from "../../lib/time";

const greeting = (hour = new Date().getHours()) =>
  hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

function StatCell({ index, icon: Icon, label, value, tone }) {
  return (
    <div className="relative border-r border-b border-border bg-card/60 p-5">
      <span aria-hidden="true" className="absolute top-4 right-4 size-5 border-t border-r border-border-strong" />
      <p className="text-[10px] text-faint tabular-nums">{index}</p>
      <p className="mt-4 text-3xl font-extrabold tabular-nums">{value ?? "–"}</p>
      <p className={cn("eyebrow mt-2 flex items-center gap-1.5", tone)}>
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 border-r border-b border-border bg-card/60 px-4 py-3.5 text-left transition-colors hover:bg-primary/[0.07]"
    >
      <span className="text-primary">&gt;</span>
      <Icon className="size-4 text-faint transition-colors group-hover:text-primary" aria-hidden="true" />
      <span className="flex-1 truncate text-[11px] font-bold tracking-[0.12em] uppercase">{label}</span>
      <ArrowRight className="size-3.5 -translate-x-1 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
    </button>
  );
}

function ActivitySkeleton() {
  return (
    <ul className="divide-y divide-border" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-3 px-5 py-3.5">
          <Skeleton className="size-10" />
          <span className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/4" />
          </span>
        </li>
      ))}
    </ul>
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

  const today = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow={`${today} / Overview`}
        title={`${greeting()}, ${firstName}`}
        description="Your conversations, assistant and encryption status at a glance."
      />

      <section aria-label="Your stats" className="grid grid-cols-2 border-t border-l border-border lg:grid-cols-4">
        <StatCell index="01" icon={MessageSquare} label="Messages" value={stats.totalMessages} tone="text-info" />
        <StatCell index="02" icon={MessagesSquare} label="Conversations" value={stats.conversations} tone="text-primary" />
        <StatCell index="03" icon={Users} label="Groups" value={stats.groups} tone="text-warning" />
        <StatCell index="04" icon={Wifi} label="Online now" value={stats.activeUsers} tone="text-success" />
      </section>

      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="eyebrow mb-3 text-faint">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 border-t border-l border-border sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction icon={SquarePen} label="New message" onClick={() => navigate("/chat", { state: { newChat: true } })} />
          <QuickAction icon={UsersRound} label="New group" onClick={() => navigate("/chat", { state: { newGroup: true } })} />
          <QuickAction icon={Search} label="Find people" onClick={() => navigate("/search")} />
          <QuickAction icon={Bot} label={`Ask ${assistant?.name ?? "AI"}`} onClick={() => navigate("/assistant")} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_21rem]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="eyebrow text-primary">Recent activity</h2>
            <Link
              to="/chat"
              className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase hover:text-primary"
            >
              All chats <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
          {!data ? (
            <ActivitySkeleton />
          ) : data.recentActivity.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={data.error ? "Couldn't load activity" : "No activity yet"}
              description={data.error ? "Try again in a moment." : "Messages people send you will show up here."}
            />
          ) : (
            <ul className="divide-y divide-border">
              {data.recentActivity.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => openActivity(a)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <UserAvatar src={a.avatar} name={a.user} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs">
                        <span className="font-bold text-foreground">{a.user}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] text-faint">{timeAgo(a.time)}</span>
                    </span>
                    {a.encrypted && <Lock className="size-3.5 text-primary" aria-label="End-to-end encrypted" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <Corners />
            <div className="flex items-center gap-3 border-b border-border p-5">
              <span className="flex size-11 items-center justify-center border border-primary/40 bg-primary/10 text-2xl">
                {assistant?.avatar ?? "🤖"}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">{assistant?.name ?? "Your assistant"}</h2>
                <p className="eyebrow mt-1 text-faint">Personal AI assistant</p>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Draft messages, summarize chats, look people up — in your assistant&apos;s own style.
              </p>
              <Button fullWidth iconRight={ArrowRight} onClick={() => navigate("/assistant")}>
                Open assistant
              </Button>
            </div>
          </Card>

          <Alert variant={encryptionOn ? "success" : "warning"} role="status" className="p-5">
            {encryptionOn ? <Lock aria-hidden="true" /> : <LockOpen aria-hidden="true" />}
            <AlertTitle className="text-xs tracking-[0.12em] uppercase">
              {encryptionOn ? "Encryption on" : e2ee.status === "locked" ? "Encryption locked" : "Encryption off"}
            </AlertTitle>
            <AlertDescription>
              <p>
                {encryptionOn
                  ? "Your direct messages are readable only by you and the people you talk to."
                  : e2ee.status === "locked"
                    ? "Unlock it on this device to read your encrypted messages here."
                    : "Turn it on so only you and your contacts can read your direct messages."}
              </p>
              {!encryptionOn && (
                <Button size="sm" variant="outline" className="mt-4" onClick={openSettings}>
                  {e2ee.status === "locked" ? "Unlock" : "Turn on"}
                </Button>
              )}
            </AlertDescription>
          </Alert>

          {incomingRequests.length > 0 && (
            <Card asChild interactive className="flex items-center gap-3 p-4">
              <Link to="/notifications">
                <span className="flex size-10 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                  <UserPlus className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold">
                    {incomingRequests.length} friend request{incomingRequests.length === 1 ? "" : "s"}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">Review them in Notifications</span>
                </span>
                <ArrowRight className="size-4 text-faint" aria-hidden="true" />
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
