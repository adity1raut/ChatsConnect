import { useMemo, useState } from "react";
import { Bell, Check, CheckCheck, Settings, Trash2, UserPlus, X } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useFriends } from "../../context/FriendContext";
import { useSettingsModal } from "../../context/SettingsModalContext";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  IconButton,
  Modal,
  SegmentedControl,
} from "../../components/ui";
import { cn } from "../../lib/cn";
import { dayBucket, timeAgo } from "../../lib/time";
import { toast } from "../../lib/toast";
import { describeNotification } from "./describe";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "messages", label: "Messages" },
  { value: "social", label: "People" },
  { value: "calls", label: "Calls" },
];

function FriendRequests() {
  const { incomingRequests, acceptRequest, rejectRequest } = useFriends();
  const [busy, setBusy] = useState(null);
  if (!incomingRequests.length) return null;

  const act = async (fn, request) => {
    setBusy(request._id);
    try {
      await fn(request._id, request.sender?._id);
    } catch (err) {
      toast({
        title: "Couldn't update the request",
        description: err.response?.data?.message,
        variant: "error",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <UserPlus className="size-4 text-accent-fg" aria-hidden="true" />
        <h2 className="text-sm font-bold">Friend requests</h2>
        <span className="text-xs text-muted">({incomingRequests.length})</span>
      </div>
      <ul className="divide-y divide-line">
        {incomingRequests.map((r) => (
          <li key={r._id} className="flex items-center gap-3 px-4 py-3">
            <Avatar src={r.sender?.avatar} name={r.sender?.name} online={r.sender?.isOnline} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{r.sender?.name}</p>
              <p className="truncate text-xs text-muted">@{r.sender?.username}</p>
            </div>
            <Button
              size="sm"
              loading={busy === r._id}
              onClick={() => act(acceptRequest, r)}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={busy === r._id}
              onClick={() => act(rejectRequest, r)}
            >
              Decline
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function NotificationRow({ n, onOpen, onMarkRead, onDismiss }) {
  const { title, body, icon: Icon } = describeNotification(n);
  const unread = !n.read;

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onOpen(n)}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3 pr-10 text-left transition-colors hover:bg-surface-2 sm:pr-24",
          unread && "bg-accent-soft/40",
        )}
      >
        <span className="relative shrink-0">
          <Avatar src={n.actor?.avatar} name={n.actor?.name || title} />
          <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-accent text-white ring-2 ring-surface">
            <Icon className="size-3" aria-hidden="true" />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm", unread ? "font-bold" : "font-medium")}>
            {title}
          </span>
          <span className="line-clamp-2 block text-xs text-muted">{body}</span>
          <span className="mt-0.5 block text-[11px] text-subtle">{timeAgo(n.updatedAt)}</span>
        </span>
      </button>

      {unread && (
        <span
          className="pointer-events-none absolute top-1/2 right-4 size-2.5 -translate-y-1/2 rounded-full bg-accent group-focus-within:opacity-0 group-hover:opacity-0"
          aria-label="Unread"
        />
      )}
      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        {unread && (
          <IconButton icon={Check} label="Mark as read" size="sm" onClick={() => onMarkRead(n)} />
        )}
        <IconButton icon={X} label="Remove" size="sm" onClick={() => onDismiss(n)} />
      </div>
    </li>
  );
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    hasMore,
    loading,
    open,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
    loadMore,
  } = useNotifications();
  const { openSettings } = useSettingsModal();
  const [filter, setFilter] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const sections = useMemo(() => {
    const visible = notifications.filter((n) => {
      if (filter === "all") return true;
      if (filter === "unread") return !n.read;
      return describeNotification(n).category === filter;
    });
    const groups = new Map();
    for (const n of visible) {
      const bucket = dayBucket(n.updatedAt);
      if (!groups.has(bucket)) groups.set(bucket, []);
      groups.get(bucket).push(n);
    }
    return [...groups.entries()];
  }, [notifications, filter]);

  const handleOpen = (n) => {
    if (!n.read) markRead([n._id]);
    open(n);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCheck}
            disabled={unreadCount === 0}
            onClick={markAllRead}
          >
            Mark all read
          </Button>
          <IconButton
            icon={Trash2}
            label="Clear all notifications"
            size="sm"
            disabled={notifications.length === 0}
            onClick={() => setConfirmClear(true)}
          />
          <IconButton
            icon={Settings}
            label="Notification settings"
            size="sm"
            onClick={openSettings}
          />
        </div>
      </header>

      <FriendRequests />

      <div className="overflow-x-auto scrollbar-none">
        <SegmentedControl
          label="Filter notifications"
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          size="sm"
        />
      </div>

      <Card padded={false} className="overflow-hidden">
        {sections.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === "all" ? "No notifications yet" : "Nothing here"}
            description={
              filter === "all"
                ? "Messages, friend requests, group invites and missed calls will show up here."
                : "Try another filter."
            }
          />
        ) : (
          sections.map(([bucket, items]) => (
            <section key={bucket} aria-label={bucket}>
              <h2 className="border-b border-line bg-surface-2/60 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-subtle uppercase">
                {bucket}
              </h2>
              <ul className="divide-y divide-line">
                {items.map((n) => (
                  <NotificationRow
                    key={n._id}
                    n={n}
                    onOpen={handleOpen}
                    onMarkRead={(x) => markRead([x._id])}
                    onDismiss={(x) => dismiss(x._id)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
        {hasMore && (
          <div className="border-t border-line p-3 text-center">
            <Button variant="ghost" size="sm" loading={loading} onClick={loadMore}>
              Load older notifications
            </Button>
          </div>
        )}
      </Card>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all notifications?"
        description="This removes them from every device. It can't be undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearAll();
                setConfirmClear(false);
              }}
            >
              Clear all
            </Button>
          </>
        }
      />
    </div>
  );
}
