import { useMemo, useState } from "react";
import { Bell, Check, CheckCheck, Settings, Trash2, UserPlus, X } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useFriends } from "../../context/FriendContext";
import { useSettingsModal } from "../../context/SettingsModalContext";
import { Button, Card, EmptyState, IconButton, Modal, PageHeader, SegmentedControl, UserAvatar } from "../../components/ui";
import { cn } from "../../lib/utils";
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
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <UserPlus className="size-3.5 text-primary" aria-hidden="true" />
        <h2 className="eyebrow flex-1 text-primary">Friend requests</h2>
        <span className="eyebrow text-faint tabular-nums">[{String(incomingRequests.length).padStart(2, "0")}]</span>
      </div>
      <ul className="divide-y divide-border">
        {incomingRequests.map((r) => (
          <li key={r._id} className="flex items-center gap-3 px-4 py-3">
            <UserAvatar src={r.sender?.avatar} name={r.sender?.name} online={r.sender?.isOnline} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{r.sender?.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">@{r.sender?.username}</p>
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
              variant="outline"
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
          "flex w-full items-start gap-3 border-l-2 px-4 py-3 pr-10 text-left transition-colors hover:bg-accent sm:pr-24",
          unread ? "border-primary bg-primary/[0.04]" : "border-transparent",
        )}
      >
        <span className="relative shrink-0">
          <UserAvatar src={n.actor?.avatar} name={n.actor?.name || title} />
          <span className="absolute -right-1.5 -bottom-1.5 flex size-5 items-center justify-center border border-primary/50 bg-popover text-primary">
            <Icon className="size-3" aria-hidden="true" />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-xs", unread ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
            {title}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{body}</span>
          <span className="mt-1 block text-[10px] tracking-[0.1em] text-faint uppercase">{timeAgo(n.updatedAt)}</span>
        </span>
      </button>

      {unread && (
        <span
          className="pointer-events-none absolute top-1/2 right-4 size-1.5 -translate-y-1/2 bg-primary shadow-[0_0_6px_var(--glow)] group-focus-within:opacity-0 group-hover:opacity-0"
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
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Inbox / Notifications"
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread — messages, requests, invites and calls.` : "You're all caught up."}
        actions={
          <>
            <Button
              variant="outline"
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
          </>
        }
      />

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

      <Card className="overflow-hidden">
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
              <h2 className="eyebrow flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2 text-faint">
                <span className="text-primary">//</span> {bucket}
              </h2>
              <ul className="divide-y divide-border">
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
          <div className="border-t border-border p-3 text-center">
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
              variant="destructive"
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
