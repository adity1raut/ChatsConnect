import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  BookOpen, Calendar, Clock, Eye, Heart, ChevronRight,
  Github, Sparkles, Zap, Cpu, Layers, Shield, MessageSquare,
  Search, Code2, Star,
} from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────

const AUTHOR = {
  name: "Nirmal",
  handle: "@nirmal_dev",
  bio: "Full-Stack Developer & CS student. Building ChatsConnect — a real-time chat platform with AI, WebRTC, and modern web tech.",
  avatar: "N",
  postCount: 6,
  totalViews: "4.9k",
  totalLikes: 356,
};

const POSTS = [
  {
    id: 1,
    title: "Building Real-Time Chat with Socket.io and React",
    excerpt:
      "A deep dive into the real-time messaging architecture of ChatsConnect — from WebSocket event design to React context management and optimistic UI updates.",
    date: "Mar 15, 2026",
    tags: ["Socket.io", "React", "WebSocket"],
    category: "Tech",
    readTime: "8 min",
    views: 1240,
    likes: 84,
    featured: true,
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "AI Features with Groq LLaMA-3.3: Smart Replies & Translation",
    excerpt:
      "How we integrated Groq's blazing-fast LLaMA model to power smart replies, auto-translation, sentiment analysis, and conversation summarization in our chat app.",
    date: "Mar 10, 2026",
    tags: ["AI", "LLM", "FastAPI"],
    category: "AI",
    readTime: "6 min",
    views: 980,
    likes: 72,
    featured: false,
    icon: Cpu,
    color: "from-violet-500 to-purple-600",
  },
  {
    id: 3,
    title: "WebRTC Group Video Calls: Implementation Deep Dive",
    excerpt:
      "Implementing peer-to-peer group video from scratch — ICE candidates, SDP negotiation, signaling servers, and the React frontend that ties it all together.",
    date: "Mar 5, 2026",
    tags: ["WebRTC", "Video", "P2P"],
    category: "Tech",
    readTime: "10 min",
    views: 860,
    likes: 61,
    featured: false,
    icon: MessageSquare,
    color: "from-rose-500 to-pink-500",
  },
  {
    id: 4,
    title: "Dockerizing a Full-Stack App with GitHub Actions CI/CD",
    excerpt:
      "Step-by-step: containerize Node.js, React, and FastAPI with Docker Compose and build a complete CI/CD pipeline using GitHub Actions workflows.",
    date: "Feb 28, 2026",
    tags: ["Docker", "CI/CD", "DevOps"],
    category: "DevOps",
    readTime: "7 min",
    views: 720,
    likes: 53,
    featured: false,
    icon: Layers,
    color: "from-orange-500 to-amber-500",
  },
  {
    id: 5,
    title: "JWT, OTP Email Verification & GitHub OAuth",
    excerpt:
      "Designing a secure multi-factor auth system with JWT access/refresh tokens, email OTP via Nodemailer, and seamless GitHub OAuth in a Node.js/Express 5 backend.",
    date: "Feb 20, 2026",
    tags: ["Auth", "JWT", "OAuth"],
    category: "Security",
    readTime: "9 min",
    views: 640,
    likes: 47,
    featured: false,
    icon: Shield,
    color: "from-indigo-500 to-blue-600",
  },
  {
    id: 6,
    title: "Tailwind CSS v4: Dark Themes & Glassmorphism UIs",
    excerpt:
      "Lessons from building ChatsConnect's UI — glassmorphism cards, animated gradient blobs, dark/light theming, and mobile-first responsive layouts.",
    date: "Feb 12, 2026",
    tags: ["CSS", "Tailwind", "UI/UX"],
    category: "Frontend",
    readTime: "5 min",
    views: 540,
    likes: 39,
    featured: false,
    icon: Code2,
    color: "from-rose-500 to-pink-500",
  },
];

const CATEGORIES = ["All", "Tech", "AI", "DevOps", "Security", "Frontend"];

function catBadgeClass(cat, isDark) {
  const map = {
    Tech:     isDark ? "bg-blue-500/15 text-blue-400 border-blue-500/25"     : "bg-blue-50 text-blue-600 border-blue-200",
    AI:       isDark ? "bg-violet-500/15 text-violet-400 border-violet-500/25" : "bg-violet-50 text-violet-600 border-violet-200",
    DevOps:   isDark ? "bg-orange-500/15 text-orange-400 border-orange-500/25" : "bg-orange-50 text-orange-600 border-orange-200",
    Security: isDark ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/25" : "bg-indigo-50 text-indigo-600 border-indigo-200",
    Frontend: isDark ? "bg-rose-500/15 text-rose-400 border-rose-500/25"     : "bg-rose-50 text-rose-600 border-rose-200",
  };
  return map[cat] ?? (isDark ? "bg-gray-500/15 text-gray-400 border-gray-500/25" : "bg-gray-50 text-gray-600 border-gray-200");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const { isDark } = useTheme();
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery] = useState("");

  const card = isDark
    ? "bg-gray-900/70 border-white/[0.08] backdrop-blur-xl"
    : "bg-white/90 border-white shadow-sm backdrop-blur-xl";

  const featured = POSTS.find((p) => p.featured);
  const showFeatured = (activeCat === "All" || activeCat === "Tech") && !query;

  const filtered = POSTS.filter((p) => {
    const matchCat = activeCat === "All" || p.category === activeCat;
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  const listPosts = showFeatured ? filtered.filter((p) => !p.featured) : filtered;

  const allTags = [...new Set(POSTS.flatMap((p) => p.tags))];

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden transition-colors duration-300 ${isDark ? "bg-[#0a0a14]" : "bg-[#f4f5ff]"}`}
      style={{
        backgroundImage: isDark
          ? "radial-gradient(ellipse at 15% 0%, rgba(139,92,246,0.22) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(236,72,153,0.14) 0%, transparent 50%)"
          : "radial-gradient(ellipse at 15% 0%, rgba(167,139,250,0.28) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(244,114,182,0.18) 0%, transparent 50%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className={`pointer-events-none absolute top-[-100px] left-[-80px] w-[420px] h-[420px] rounded-full blur-[110px] opacity-25 ${isDark ? "bg-violet-600" : "bg-violet-400"}`}
        style={{ animation: "float 12s ease-in-out infinite" }}
      />
      <div
        className={`pointer-events-none absolute top-[55%] right-[-80px] w-[320px] h-[320px] rounded-full blur-[90px] opacity-20 ${isDark ? "bg-pink-600" : "bg-pink-300"}`}
        style={{ animation: "float 16s ease-in-out infinite", animationDelay: "-5s" }}
      />

      <style>{`
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-18px) scale(1.04)}66%{transform:translate(-14px,14px) scale(.96)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-8" style={{ animation: "slideUp .4s cubic-bezier(.16,1,.3,1) both" }}>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border ${isDark ? "bg-violet-500/15 text-violet-400 border-violet-500/25" : "bg-violet-50 text-violet-600 border-violet-200"}`}>
            <BookOpen size={10} strokeWidth={3} /> Dev Blog
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-gray-900"}`}>
                Nirmal's Blog
              </h1>
              <p className={`text-sm mt-1.5 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Thoughts on full-stack development, AI, and building ChatsConnect
              </p>
            </div>
            {/* Search */}
            <div className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border text-sm w-full sm:w-64 ${isDark ? "bg-white/[0.04] border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700 shadow-sm"}`}>
              <Search size={14} className={`shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`} strokeWidth={2} />
              <input
                type="text"
                placeholder="Search posts or tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none flex-1 text-xs placeholder:opacity-50 min-w-0"
              />
            </div>
          </div>
        </div>

        {/* Main 2-col grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6"
          style={{ animation: "slideUp .45s .06s cubic-bezier(.16,1,.3,1) both" }}
        >

          {/* LEFT — posts */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Featured post */}
            {showFeatured && featured && (
              <div className={`rounded-2xl border overflow-hidden transition-all hover:scale-[1.005] hover:-translate-y-0.5 ${card}`}>
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 opacity-80" />
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/25" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                      <Star size={9} strokeWidth={2.5} fill="currentColor" /> Featured
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${catBadgeClass(featured.category, isDark)}`}>
                      {featured.category}
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${featured.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <featured.icon size={24} className="text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {featured.title}
                      </h2>
                      <p className={`text-sm leading-relaxed line-clamp-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {featured.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-5">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      <Calendar size={12} /> {featured.date}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      <Clock size={12} /> {featured.readTime} read
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      <Eye size={12} /> {featured.views.toLocaleString()}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      <Heart size={12} /> {featured.likes}
                    </span>
                    <div className="flex flex-wrap gap-1.5 ml-auto">
                      {featured.tags.map((tag) => (
                        <span key={tag} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? "bg-white/[0.05] border-white/10 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.map((cat) => {
                const isActive = activeCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 border ${isActive
                      ? "text-white border-transparent shadow-sm"
                      : isDark
                        ? "text-gray-500 border-white/[0.08] hover:text-gray-300 hover:bg-white/[0.05]"
                        : "text-gray-500 border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
                    }`}
                    style={isActive ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Post list */}
            {listPosts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {listPosts.map((post) => {
                  const Icon = post.icon;
                  return (
                    <div
                      key={post.id}
                      className={`rounded-2xl border overflow-hidden transition-all hover:scale-[1.005] hover:-translate-y-0.5 ${card}`}
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${post.color} flex items-center justify-center shadow-md flex-shrink-0 mt-0.5`}>
                            <Icon size={18} className="text-white" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${catBadgeClass(post.category, isDark)}`}>
                                {post.category}
                              </span>
                              {post.tags.slice(0, 2).map((t) => (
                                <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? "bg-white/[0.04] border-white/10 text-gray-500" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                                  {t}
                                </span>
                              ))}
                            </div>
                            <h3 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                              {post.title}
                            </h3>
                            <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              {post.excerpt}
                            </p>
                            <div className={`flex items-center gap-3 mt-2.5 text-xs font-medium flex-wrap ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                              <span className="flex items-center gap-1"><Calendar size={11} /> {post.date}</span>
                              <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
                              <span className="flex items-center gap-1"><Eye size={11} /> {post.views.toLocaleString()}</span>
                              <span className="flex items-center gap-1 ml-auto"><Heart size={11} /> {post.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`rounded-2xl border p-12 flex flex-col items-center text-center ${card}`}>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: isDark ? "rgba(139,92,246,.1)" : "rgba(167,139,250,.15)",
                    border: `1px solid ${isDark ? "rgba(139,92,246,.2)" : "rgba(139,92,246,.15)"}`,
                  }}
                >
                  <BookOpen size={24} className="text-violet-400" strokeWidth={1.5} />
                </div>
                <h3 className={`font-bold text-base mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>No posts found</h3>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Try a different category or search term
                </p>
                <button
                  onClick={() => { setActiveCat("All"); setQuery(""); }}
                  className={`mt-3 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${isDark ? "border-white/10 text-gray-300 hover:bg-white/[0.06]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div className="flex flex-col gap-4">

            {/* Author card */}
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-pink-500 opacity-60" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
                  >
                    {AUTHOR.avatar}
                  </div>
                  <div>
                    <h3 className={`font-extrabold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{AUTHOR.name}</h3>
                    <p className={`text-[11px] font-medium ${isDark ? "text-violet-400" : "text-violet-600"}`}>{AUTHOR.handle}</p>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {AUTHOR.bio}
                </p>

                {/* Stats */}
                <div className={`flex items-center gap-4 py-3 border-t border-b mb-4 ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}>
                  <div className="text-center flex-1">
                    <div className={`text-lg font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{AUTHOR.postCount}</div>
                    <div className={`text-[10px] font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>Posts</div>
                  </div>
                  <div className={`w-px h-8 ${isDark ? "bg-white/[0.06]" : "bg-gray-200"}`} />
                  <div className="text-center flex-1">
                    <div className={`text-lg font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{AUTHOR.totalViews}</div>
                    <div className={`text-[10px] font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>Views</div>
                  </div>
                  <div className={`w-px h-8 ${isDark ? "bg-white/[0.06]" : "bg-gray-200"}`} />
                  <div className="text-center flex-1">
                    <div className={`text-lg font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{AUTHOR.totalLikes}</div>
                    <div className={`text-[10px] font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>Likes</div>
                  </div>
                </div>

                <button className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all hover:scale-[1.02] ${isDark ? "bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/[0.08]" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-white hover:shadow-sm"}`}>
                  <Github size={13} strokeWidth={2} /> View on GitHub
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                    <BookOpen size={12} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Categories</h3>
                </div>
                <div className="flex flex-col gap-1.5">
                  {CATEGORIES.slice(1).map((cat) => {
                    const count = POSTS.filter((p) => p.category === cat).length;
                    const isActive = activeCat === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCat(isActive ? "All" : cat)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all w-full ${isActive
                          ? "text-white border-transparent shadow-sm"
                          : isDark
                            ? "bg-white/[0.03] border-white/[0.08] text-gray-300 hover:bg-white/[0.06]"
                            : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-white hover:border-gray-200 hover:shadow-sm"
                        }`}
                        style={isActive ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}
                      >
                        <span className="flex items-center gap-2">
                          <ChevronRight size={12} />
                          {cat}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : isDark ? "bg-white/[0.08] text-gray-400" : "bg-gray-200 text-gray-500"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Popular tags */}
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 to-pink-500 opacity-60" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md">
                    <Sparkles size={12} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Popular Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(query === tag ? "" : tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${
                        query === tag
                          ? "text-white border-transparent shadow-sm"
                          : isDark
                            ? "bg-white/[0.04] border-white/10 text-gray-400 hover:bg-white/[0.08] hover:text-gray-200"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-sm"
                      }`}
                      style={query === tag ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
