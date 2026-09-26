import { useEffect, useState } from "react";
import { Check, Search } from "lucide-react";
import axios from "../../../config/axiosInstance.js";
import { API_URL } from "../../../config/api.js";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import { InputField, Spinner, UserAvatar } from "../../../components/ui";
import { cn } from "../../../lib/utils";

const DEBOUNCE_MS = 250;

/**
 * Search people and pick them. `selectedIds` shows ticks (multi-select);
 * `excludeIds` hides people (e.g. current members). You are never listed.
 * With `showAllWhenEmpty`, an empty query lists everyone.
 */
export default function UserPicker({
  onPick,
  selectedIds,
  excludeIds,
  showAllWhenEmpty = false,
  placeholder = "Search by name or @username",
  autoFocus = true,
}) {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState({ query: null, users: [] });

  const trimmed = query.trim();
  const active = Boolean(trimmed) || showAllWhenEmpty;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      const request = trimmed
        ? axios.get(`${API_URL}/profile/search`, { params: { query: trimmed, limit: 20 } })
        : axios.get(`${API_URL}/profile/all`, { params: { limit: 30 } });
      request
        .then(({ data }) => !cancelled && setResult({ query: trimmed, users: data.users ?? [] }))
        .catch(() => !cancelled && setResult({ query: trimmed, users: [] }));
    }, trimmed ? DEBOUNCE_MS : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, active]);

  const loading = active && result.query !== trimmed;
  const users = active
    ? result.users.filter((u) => u._id !== user?._id && !excludeIds?.has(u._id))
    : [];

  return (
    <div className="space-y-2">
      <InputField
        icon={Search}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search people"
        data-autofocus={autoFocus || undefined}
      />
      <div className="max-h-72 min-h-24 overflow-y-auto border border-border scrollbar-thin">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner label="Searching" />
          </div>
        ) : !active ? (
          <p className="eyebrow px-4 py-8 text-center text-faint">Type a name to search</p>
        ) : users.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-faint">
            {trimmed ? `No one found for "${trimmed}"` : "No one to show"}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {users.map((u) => {
              const selected = selectedIds?.has(u._id);
              return (
                <li key={u._id}>
                  <button
                    type="button"
                    onClick={() => onPick(u)}
                    aria-pressed={selectedIds ? Boolean(selected) : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors hover:bg-accent",
                      selected ? "border-primary bg-primary/10" : "border-transparent",
                    )}
                  >
                    <UserAvatar src={u.avatar} name={u.name} size="sm" online={onlineUsers.has(u._id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">{u.name}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">@{u.username}</span>
                    </span>
                    {selectedIds && (
                      <span
                        className={cn(
                          "flex size-4.5 items-center justify-center border",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong",
                        )}
                      >
                        {selected && <Check className="size-3" aria-hidden="true" />}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
