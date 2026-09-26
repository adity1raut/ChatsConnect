import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, MessageCircle, Search, Users, X } from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { Card, EmptyState, IconButton, PageHeader, SegmentedControl, Skeleton, UserAvatar } from "../../components/ui";
import FriendAction from "../profile/FriendAction";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "people", label: "People" },
  { value: "groups", label: "Groups" },
];
const RECENT_KEY = "recentSearches";
const MAX_RECENT = 6;

const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeRecent = (list) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // storage unavailable
  }
};

// Bold the part of `text` that matches the query
function Highlight({ text = "", query }) {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-primary/15 text-primary">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

function PersonRow({ person, query, online }) {
  const navigate = useNavigate();
  return (
    <li className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60">
      <Link to={`/profile/${person._id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <UserAvatar src={person.avatar} name={person.name} online={online} />
        <span className="min-w-0">
          <span className="block truncate text-xs font-bold">
            <Highlight text={person.name} query={query} />
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
            @<Highlight text={person.username} query={query} />
            {person.statusMessage && <span className="text-faint"> · {person.statusMessage}</span>}
          </span>
        </span>
      </Link>
      <IconButton
        icon={MessageCircle}
        label={`Message ${person.name}`}
        size="sm"
        variant="secondary"
        onClick={() =>
          navigate("/chat", {
            state: { openChat: { id: person._id, name: person.name, username: person.username, avatar: person.avatar } },
          })
        }
      />
      <div className="hidden xs:block">
        <FriendAction userId={person._id} name={person.name} size="sm" />
      </div>
    </li>
  );
}

function GroupRow({ group, query }) {
  return (
    <li>
      <Link
        to="/chat"
        state={{ openGroup: { groupId: group._id } }}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
      >
        <UserAvatar src={group.avatar} name={group.name} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold">
            <Highlight text={group.name} query={query} />
          </span>
          <span className="eyebrow mt-1 block text-faint">{group.members?.length ?? 0} members</span>
        </span>
      </Link>
    </li>
  );
}

function ResultSection({ title, children, count }) {
  return (
    <Card className="overflow-hidden">
      <h2 className="eyebrow flex items-center justify-between border-b border-border px-4 py-3 text-primary">
        {title}
        {count !== undefined && <span className="text-faint tabular-nums">[{String(count).padStart(2, "0")}]</span>}
      </h2>
      <ul className="divide-y divide-border">{children}</ul>
    </Card>
  );
}

export default function SearchPage() {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [recent, setRecent] = useState(readRecent);
  const [suggested, setSuggested] = useState(null);
  const [myGroups, setMyGroups] = useState([]);
  const [result, setResult] = useState({ query: null, people: [] });
  const trimmed = query.trim();

  // Suggestions and my groups, once
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      axios.get(`${API_URL}/profile/all`, { params: { limit: 12 } }),
      axios.get(`${API_URL}/groups/my`),
    ]).then(([people, groups]) => {
      if (cancelled) return;
      setSuggested(people.status === "fulfilled" ? people.value.data.users.filter((u) => u._id !== user?._id) : []);
      if (groups.status === "fulfilled") setMyGroups(groups.value.data.groups ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  // Debounced people search
  useEffect(() => {
    if (!trimmed) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      axios
        .get(`${API_URL}/profile/search`, { params: { query: trimmed, limit: 20 } })
        .then(({ data }) => {
          if (cancelled) return;
          setResult({ query: trimmed, people: (data.users ?? []).filter((u) => u._id !== user?._id) });
          setRecent((prev) => {
            const next = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
            writeRecent(next);
            return next;
          });
        })
        .catch(() => !cancelled && setResult({ query: trimmed, people: [] }));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, user?._id]);

  const groups = useMemo(
    () => (trimmed ? myGroups.filter((g) => g.name.toLowerCase().includes(trimmed.toLowerCase())) : myGroups),
    [myGroups, trimmed],
  );
  const searching = Boolean(trimmed) && result.query !== trimmed;
  const people = trimmed ? result.people : suggested ?? [];
  const showPeople = filter !== "groups";
  const showGroups = filter !== "people";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader eyebrow="Directory / Search" title="Find people" description="Search by name or username, or jump into one of your groups." />

      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-bold text-primary" aria-hidden="true">
          &gt;
        </span>
        <Search className="pointer-events-none absolute top-1/2 left-9 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people and your groups"
          aria-label="Search people and your groups"
          autoFocus
          className="h-13 w-full border border-border-strong bg-card pr-12 pl-16 text-sm text-foreground outline-none placeholder:text-faint focus:border-primary focus:shadow-[0_0_0_1px_var(--primary),0_0_24px_var(--glow)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center text-faint hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl label="Search in" options={FILTERS} value={filter} onChange={setFilter} size="sm" />
        {!trimmed &&
          recent.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuery(q)}
              className="inline-flex h-8 items-center gap-1.5 border border-border px-2.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary"
            >
              <Clock className="size-3" aria-hidden="true" />
              {q}
            </button>
          ))}
        {!trimmed && recent.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setRecent([]);
              writeRecent([]);
            }}
            className="eyebrow px-1 text-faint hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {showPeople &&
        (searching || suggested === null ? (
          <Card className="divide-y divide-border" aria-busy="true" aria-label="Searching">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-10" />
                <span className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-2.5 w-1/5" />
                </span>
              </div>
            ))}
          </Card>
        ) : people.length ? (
          <ResultSection title={trimmed ? "People" : "People you may know"} count={trimmed ? people.length : undefined}>
            {people.map((p) => (
              <PersonRow key={p._id} person={p} query={trimmed} online={onlineUsers.has(p._id)} />
            ))}
          </ResultSection>
        ) : (
          trimmed && (
            <Card className="p-5">
              <EmptyState icon={Search} title={`No people found for "${trimmed}"`} description="Try a different name or username." />
            </Card>
          )
        ))}

      {showGroups && groups.length > 0 && (
        <ResultSection title="Your groups" count={groups.length}>
          {groups.map((g) => (
            <GroupRow key={g._id} group={g} query={trimmed} />
          ))}
        </ResultSection>
      )}
      {showGroups && filter === "groups" && groups.length === 0 && (
        <Card className="p-5">
          <EmptyState
            icon={Users}
            title={trimmed ? `No groups match "${trimmed}"` : "You're not in any groups yet"}
            description="Create one from Messages."
          />
        </Card>
      )}
    </div>
  );
}
