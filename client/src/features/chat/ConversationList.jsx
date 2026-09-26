import { useMemo, useState } from "react";
import { MessageSquare, Search, SquarePen, Users, UsersRound, X } from "lucide-react";
import { CountBadge, EmptyState, IconButton, SegmentedControl, UserAvatar } from "../../components/ui";
import { cn } from "../../lib/utils";
import { timeAgo } from "../../lib/time";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "user", label: "People" },
  { value: "group", label: "Groups" },
];

function ContactRow({ contact, selected, onSelect }) {
  const isGroup = contact.type === "group";
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(contact)}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors",
          selected ? "border-primary bg-primary/10" : "border-transparent hover:bg-accent",
        )}
      >
        <UserAvatar
          src={contact.avatar}
          name={contact.name}
          size="md"
          online={contact.isOnline}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "truncate text-xs text-foreground",
                contact.unread ? "font-extrabold" : "font-bold",
              )}
            >
              {contact.name}
            </span>
            {contact.lastMessageAt && contact.lastMessage && (
              <span className="shrink-0 text-[10px] tracking-[0.06em] text-faint uppercase">
                {timeAgo(contact.lastMessageAt)}
              </span>
            )}
          </span>
          <span className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "mt-0.5 truncate text-[11px]",
                contact.unread ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {contact.lastMessage ||
                (isGroup ? `${contact.memberCount} members` : "Start a conversation")}
            </span>
            <CountBadge count={contact.unread} />
          </span>
        </span>
      </button>
    </li>
  );
}

export default function ConversationList({
  contacts,
  discover,
  selectedChat,
  onSelect,
  onStartChatWith,
  onNewDM,
  onNewGroup,
  className,
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter(
      (c) =>
        (filter === "all" || c.type === filter) &&
        (!q ||
          c.name.toLowerCase().includes(q) ||
          c.username?.toLowerCase().includes(q) ||
          c.lastMessage?.toLowerCase().includes(q)),
    );
  }, [contacts, filter, query]);

  const suggestions = !query && filter !== "group" ? discover.slice(0, 8) : [];
  const isSelected = (c) =>
    selectedChat?.type === c.type &&
    (c.type === "group" ? selectedChat.groupId === c.groupId : selectedChat.id === c.id);

  return (
    <aside
      className={cn(
        "h-full w-full shrink-0 flex-col border-r border-border bg-card/50 md:w-80",
        className,
      )}
      aria-label="Conversations"
    >
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow text-faint">Channels</p>
            <h1 className="mt-1 text-base font-extrabold tracking-[0.12em] uppercase">Messages</h1>
          </div>
          <div className="flex gap-1">
            <IconButton icon={SquarePen} label="New message" size="sm" variant="secondary" onClick={onNewDM} />
            <IconButton icon={UsersRound} label="New group" size="sm" variant="secondary" onClick={onNewGroup} />
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-9 w-full border border-border bg-background pr-9 pl-9 text-xs text-foreground outline-none placeholder:text-faint focus:border-primary focus:shadow-[0_0_0_1px_var(--primary)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center text-faint hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <SegmentedControl
          label="Filter conversations"
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          size="sm"
          className="w-full [&>button]:flex-1"
        />
      </div>

      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {visible.length > 0 ? (
          <ul>
            {visible.map((c) => (
              <ContactRow
                key={`${c.type}:${c.id}`}
                contact={c}
                selected={isSelected(c)}
                onSelect={onSelect}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={query ? Search : filter === "group" ? Users : MessageSquare}
            title={query ? `No results for "${query}"` : filter === "group" ? "No groups yet" : "No conversations yet"}
            description={query ? undefined : "Start one from the people below or the buttons above."}
            className="py-8"
          />
        )}

        {suggestions.length > 0 && (
          <div className="mt-4">
            <h2 className="eyebrow flex items-center gap-2 px-4 pb-2 text-faint">
              <span className="text-primary">//</span> People you can message
            </h2>
            <ul>
              {suggestions.map((u) => (
                <li key={u._id}>
                  <button
                    type="button"
                    onClick={() => onStartChatWith(u)}
                    className="group flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-accent"
                  >
                    <UserAvatar src={u.avatar} name={u.name} size="sm" online={u.isOnline} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">{u.name}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">@{u.username}</span>
                    </span>
                    <MessageSquare className="size-4 text-faint group-hover:text-primary" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
