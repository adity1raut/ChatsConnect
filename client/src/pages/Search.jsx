import { useState } from "react";
import {
  Search, X, User, Users, MessageSquare, Phone,
  TrendingUp, Hash, Clock, Star, ArrowRight,
  AtSign, Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle";

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "people", label: "People", icon: User },
  { id: "groups", label: "Groups", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

const TRENDING = [
  { tag: "design-team", count: "24 members" },
  { tag: "project-alpha", count: "12 members" },
  { tag: "react-devs", count: "89 members" },
  { tag: "ui-updates", count: "8 messages" },
];

const SUGGESTIONS = [
  { id: 1, name: "Sarah Johnson", username: "sarahj", avatar: "👩", status: "online", role: "Designer", mutual: 3 },
  { id: 2, name: "Mike Chen", username: "mikechen", avatar: "👨", status: "away", role: "Developer", mutual: 7 },
  { id: 3, name: "Emma Wilson", username: "emmaw", avatar: "👩‍💼", status: "online", role: "Product Manager", mutual: 5 },
  { id: 4, name: "Alex Brown", username: "alexb", avatar: "👨‍💻", status: "offline", role: "Engineer", mutual: 2 },
  { id: 5, name: "Lisa Martinez", username: "lisam", avatar: "👩‍🦰", status: "online", role: "Designer", mutual: 9 },
  { id: 6, name: "Jordan Lee", username: "jlee", avatar: "🧑‍💻", status: "offline", role: "Data Scientist", mutual: 1 },
];

const GROUPS = [
  { id: 1, name: "Team Alpha", avatar: "👥", members: 8, activity: "Active 2m ago", description: "Core project team" },
  { id: 2, name: "Project Discuss", avatar: "💼", members: 12, activity: "Active 15m ago", description: "Project discussion channel" },
  { id: 3, name: "UI/UX Design", avatar: "🎨", members: 6, activity: "Active 1h ago", description: "Design collaboration" },
  { id: 4, name: "Dev Team", avatar: "⚙️", members: 15, activity: "Active 3h ago", description: "Engineering discussions" },
];

const RECENT_SEARCHES = ["dashboard design", "team alpha", "sarah", "video call setup"];

export default function SearchPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const filteredPeople = SUGGESTIONS.filter((p) =>
    !query ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.username.toLowerCase().includes(query.toLowerCase()) ||
    p.role.toLowerCase().includes(query.toLowerCase())
  );

  const filteredGroups = GROUPS.filter((g) =>
    !query ||
    g.name.toLowerCase().includes(query.toLowerCase()) ||
    g.description.toLowerCase().includes(query.toLowerCase())
  );

  const showPeople = activeCategory === "all" || activeCategory === "people";
  const showGroups = activeCategory === "all" || activeCategory === "groups";
  const hasResults = filteredPeople.length > 0 || filteredGroups.length > 0;

  const clearSearch = () => setQuery("");
  const removeRecent = (term) => setRecentSearches((prev) => prev.filter((t) => t !== term));
  const handleSearch = (term) => {
    if (!term.trim()) return;
    setQuery(term);
    if (!recentSearches.includes(term))
      setRecentSearches((prev) => [term, ...prev].slice(0, 6));
  };

  const card = isDark
    ? "bg-gray-900/70 border-white/8 backdrop-blur-xl"
    : "bg-white/90 border-white shadow-sm backdrop-blur-xl";

  return (
    <div
      className={`relative flex-1 overflow-y-auto min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0a0a14]" : "bg-[#f4f5ff]"}`}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse at 15% 0%, rgba(139,92,246,0.22) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(236,72,153,0.14) 0%, transparent 50%)"
              : "radial-gradient(ellipse at 15% 0%, rgba(167,139,250,0.28) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(244,114,182,0.18) 0%, transparent 50%)",
          }}
        />
        <div
          className={`absolute -top-20 right-[10%] w-95 h-95 rounded-full blur-[90px] opacity-20 ${isDark ? "bg-violet-600" : "bg-violet-400"}`}
          style={{ animation: "float 12s ease-in-out infinite" }}
        />
        <div
          className={`absolute bottom-[10%] -left-15 w-75 h-75 rounded-full blur-[90px] opacity-15 ${isDark ? "bg-pink-600" : "bg-pink-300"}`}
          style={{ animation: "float 16s ease-in-out infinite", animationDelay: "-5s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(16px,-16px) scale(1.04)}66%{transform:translate(-12px,12px) scale(.96)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Theme toggle — desktop only */}
      <div className="absolute top-5 right-5 z-10 hidden md:block"><ThemeToggle /></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Header ── */}
        <div className="mb-6 sm:mb-8" style={{ animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 border ${isDark ? "bg-violet-500/15 text-violet-400 border-violet-500/25" : "bg-violet-50 text-violet-600 border-violet-200"}`}>
            <Search size={11} strokeWidth={2.5} /> Discover
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Search{" "}
            <span className="bg-linear-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Everything</span>
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Find people, groups, and conversations
          </p>
        </div>

        {/* ── Search bar ── */}
        <div
          className={`relative flex items-center rounded-2xl border transition-all duration-200 mb-4 sm:mb-5 ${isDark
            ? "bg-gray-900/70 border-white/10 focus-within:border-violet-500/50 focus-within:shadow-lg focus-within:shadow-violet-500/10"
            : "bg-white/90 border-gray-200 focus-within:border-violet-400 focus-within:shadow-lg focus-within:shadow-violet-500/10 shadow-sm"
            }`}
          style={{ animation: "slideUp 0.42s 0.04s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <Search className={`absolute left-4 w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          <input
            autoFocus
            type="text"
            placeholder="Search people, groups..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            className="flex-1 bg-transparent pl-10 sm:pl-12 pr-12 py-3.5 sm:py-4 text-sm outline-none placeholder-gray-400"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          />
          {query && (
            <button
              onClick={clearSearch}
              className={`absolute right-4 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:scale-110 ${isDark ? "text-gray-500 hover:text-gray-300 hover:bg-white/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* ── Category tabs ── */}
        <div
          className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1 scrollbar-none"
          style={{ animation: "slideUp 0.44s 0.06s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const isActive = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 border transition-all duration-200 ${isActive
                  ? "text-white border-transparent shadow-md"
                  : isDark
                    ? "text-gray-400 border-white/8 bg-white/4 hover:bg-white/8 hover:text-gray-200"
                    : "text-gray-500 border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-700 shadow-sm"
                  }`}
                style={isActive ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}
              >
                <Icon size={13} strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Main grid — 2/3 + 1/3 on lg, stacked on mobile ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
          style={{ animation: "slideUp 0.46s 0.08s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {/* ── Main results — always first on mobile, left 2/3 on desktop ── */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">

            {query === "" ? (
              <>
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className={`rounded-2xl border overflow-hidden ${card}`}>
                    <div className="h-0.5 w-full bg-linear-to-r from-violet-500 to-pink-500 opacity-70" />
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                            <Clock size={14} className="text-white" strokeWidth={2.5} />
                          </div>
                          <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Recent Searches</h3>
                        </div>
                        <button
                          onClick={() => setRecentSearches([])}
                          className={`text-xs font-semibold transition-colors ${isDark ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"}`}
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            onClick={() => handleSearch(term)}
                            className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl border text-sm cursor-pointer group transition-all ${isDark ? "bg-white/4 border-white/8 text-gray-300 hover:bg-white/8" : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-white hover:shadow-sm"}`}
                          >
                            <Clock size={12} className={isDark ? "text-gray-600" : "text-gray-400"} />
                            {term}
                            <X
                              size={11}
                              strokeWidth={2.5}
                              onClick={(e) => { e.stopPropagation(); removeRecent(term); }}
                              className={`cursor-pointer transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested people */}
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                  <div className="h-0.5 w-full bg-linear-to-r from-emerald-500 to-teal-500 opacity-60" />
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4 sm:mb-5">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                        <Star size={14} className="text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Suggested People</h3>
                    </div>
                    <div className="flex flex-col gap-1">
                      {SUGGESTIONS.map((person) => (
                        <PersonCard key={person.id} person={person} isDark={isDark} navigate={navigate} />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : hasResults ? (
              <>
                {showPeople && filteredPeople.length > 0 && (
                  <div className={`rounded-2xl border overflow-hidden ${card}`}>
                    <div className="h-0.5 w-full bg-linear-to-r from-violet-500 to-pink-500 opacity-70" />
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-white/8" : "bg-gray-100"}`}>
                          <User size={14} className={isDark ? "text-gray-400" : "text-gray-500"} />
                        </div>
                        <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          People · {filteredPeople.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {filteredPeople.map((person) => (
                          <PersonCard key={person.id} person={person} isDark={isDark} navigate={navigate} query={query} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {showGroups && filteredGroups.length > 0 && (
                  <div className={`rounded-2xl border overflow-hidden ${card}`}>
                    <div className="h-0.5 w-full bg-linear-to-r from-blue-500 to-cyan-500 opacity-60" />
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-white/8" : "bg-gray-100"}`}>
                          <Users size={14} className={isDark ? "text-gray-400" : "text-gray-500"} />
                        </div>
                        <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          Groups · {filteredGroups.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {filteredGroups.map((group) => (
                          <GroupCard key={group.id} group={group} isDark={isDark} navigate={navigate} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* No results */
              <div className={`rounded-2xl border overflow-hidden ${card}`}>
                <div className="h-0.5 w-full bg-linear-to-r from-violet-500 to-pink-500 opacity-70" />
                <div className="py-16 sm:py-20 flex flex-col items-center text-center px-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: isDark ? "rgba(139,92,246,.1)" : "rgba(167,139,250,.15)", border: `1px solid ${isDark ? "rgba(139,92,246,.2)" : "rgba(139,92,246,.15)"}` }}
                  >
                    <Search size={26} className="text-violet-400" strokeWidth={1.5} />
                  </div>
                  <h3 className={`font-bold text-base mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>
                    No results for "{query}"
                  </h3>
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Try a different keyword or check the spelling
                  </p>
                  <button
                    onClick={clearSearch}
                    className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${isDark ? "border-white/10 text-gray-300 hover:bg-white/6" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    Clear search
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar — stacks below on mobile, 1/3 on desktop ── */}
          <div className="flex flex-col gap-4">

            {/* Trending */}
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              <div className="h-0.5 w-full bg-linear-to-r from-orange-500 to-amber-500 opacity-70" />
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shrink-0">
                    <TrendingUp size={14} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Trending</h3>
                </div>

                {/* Mobile: horizontal chip scroll */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:hidden">
                  {TRENDING.map(({ tag }) => (
                    <button
                      key={tag}
                      onClick={() => handleSearch(tag)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] ${isDark ? "bg-white/4 border-white/8 text-gray-300 hover:bg-white/8" : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-white hover:shadow-sm"}`}
                    >
                      <Hash size={11} className={isDark ? "text-violet-400" : "text-violet-500"} strokeWidth={2.5} />
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Desktop: vertical list */}
                <div className="hidden lg:flex flex-col gap-2">
                  {TRENDING.map(({ tag, count }) => (
                    <button
                      key={tag}
                      onClick={() => handleSearch(tag)}
                      className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all w-full text-left hover:scale-[1.02] ${isDark ? "bg-white/3 border-white/8 hover:bg-white/7" : "bg-gray-50 border-gray-100 hover:bg-white hover:shadow-sm"}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-500"}`}>
                        <Hash size={14} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>{tag}</p>
                        <p className={`text-[10px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>{count}</p>
                      </div>
                      <ArrowRight size={13} className={`shrink-0 group-hover:translate-x-0.5 transition-transform ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Groups */}
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              <div className="h-0.5 w-full bg-linear-to-r from-blue-500 to-cyan-500 opacity-60" />
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shrink-0">
                    <Users size={14} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Active Groups</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {GROUPS.map((g, i) => (
                    <button
                      key={g.id}
                      onClick={() => navigate("/chat")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all hover:scale-[1.01] w-full text-left ${isDark ? "bg-white/3 border-white/8 hover:bg-white/7" : "bg-gray-50 border-gray-100 hover:bg-white hover:shadow-sm"}
                        ${i >= 2 ? "hidden lg:flex" : "flex"}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-base shrink-0">
                        {g.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>{g.name}</p>
                        <p className={`text-[10px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>{g.members} members · {g.activity}</p>
                      </div>
                      <ArrowRight size={12} className={`shrink-0 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                    </button>
                  ))}
                  <button
                    onClick={() => navigate("/chat")}
                    className={`lg:hidden text-xs font-semibold text-center py-1.5 rounded-xl transition-colors ${isDark ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"}`}
                  >
                    See all groups →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Person card ─── */
function PersonCard({ person, isDark, navigate, query = "" }) {
  const highlight = (text) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className={`rounded px-0.5 bg-transparent ${isDark ? "text-violet-300 underline underline-offset-2" : "text-violet-700 underline underline-offset-2"}`}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const statusColors = { online: "bg-emerald-500", away: "bg-amber-400", offline: "bg-gray-400" };

  return (
    <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl transition-all duration-200 cursor-pointer group ${isDark ? "hover:bg-white/4" : "hover:bg-gray-50"}`}>
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-400 via-purple-500 to-pink-400 flex items-center justify-center text-lg shadow-md">
          {person.avatar}
        </div>
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${statusColors[person.status]} ${isDark ? "border-gray-900" : "border-white"}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-semibold text-sm truncate ${isDark ? "text-gray-100" : "text-gray-800"}`}>
            {highlight(person.name)}
          </p>
          {person.status === "online" && (
            <span className="text-[10px] font-medium text-emerald-500 hidden sm:inline shrink-0">● online</span>
          )}
        </div>
        <p className={`text-xs flex items-center gap-1 mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          <AtSign size={10} className="shrink-0" />
          <span className="truncate">{person.username} · {person.role}</span>
        </p>
        {person.mutual > 0 && (
          <p className={`text-[10px] mt-0.5 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
            {person.mutual} mutual connection{person.mutual !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Action buttons — always visible on mobile, hover-only on desktop */}
      <div className="flex gap-1.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); navigate("/chat"); }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-50 text-violet-600"}`}
        >
          <MessageSquare size={13} strokeWidth={2} />
        </button>
        <button
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"}`}
        >
          <Phone size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ─── Group card ─── */
function GroupCard({ group, isDark, navigate }) {
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl transition-all duration-200 cursor-pointer group ${isDark ? "hover:bg-white/4" : "hover:bg-gray-50"}`}
      onClick={() => navigate("/chat")}
    >
      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 via-purple-500 to-pink-400 flex items-center justify-center text-lg shadow-md shrink-0">
        {group.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${isDark ? "text-gray-100" : "text-gray-800"}`}>{group.name}</p>
        <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>{group.description}</p>
        <p className={`text-[10px] mt-0.5 flex items-center gap-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
          <Users size={9} />{group.members} members · {group.activity}
        </p>
      </div>
      <ArrowRight size={14} className={`shrink-0 group-hover:translate-x-0.5 transition-transform ${isDark ? "text-gray-600" : "text-gray-300"}`} />
    </div>
  );
}
