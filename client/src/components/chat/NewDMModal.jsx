import { useState, useEffect, useCallback } from "react";
import { X, Search, MessageSquare, Loader2 } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function NewDMModal({ onClose, onSelectUser }) {
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (q) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const url = q.trim()
        ? `${API}/profile/search?query=${encodeURIComponent(q)}`
        : `${API}/profile/all`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all users on mount, then debounce search
  useEffect(() => {
    searchUsers("");
  }, [searchUsers]);

  useEffect(() => {
    if (search === "") return;
    const t = setTimeout(() => searchUsers(search), 300);
    return () => clearTimeout(t);
  }, [search, searchUsers]);

  const base = isDark
    ? "bg-gray-900 border-white/10 text-white"
    : "bg-white border-gray-200 text-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl ${base}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/6" : "border-gray-100"}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <MessageSquare size={14} className="text-white" />
            </div>
            <h2 className="font-bold text-base">New Message</h2>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "hover:bg-white/8 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Search input */}
          <div className={`relative flex items-center rounded-xl border ${isDark ? "bg-white/4 border-white/10" : "bg-gray-50 border-gray-200"}`}>
            {loading ? (
              <Loader2 size={15} className="absolute left-3.5 text-gray-500 animate-spin" />
            ) : (
              <Search size={15} className="absolute left-3.5 text-gray-500" />
            )}
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none"
              style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
            />
          </div>

          {/* Results list */}
          <div className={`rounded-xl border max-h-72 overflow-y-auto ${isDark ? "border-white/6" : "border-gray-100"}`}>
            {searchResults.length === 0 && !loading ? (
              <p className={`text-center py-8 text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                {search.trim() ? "No users found" : "No users available"}
              </p>
            ) : (
              searchResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => { onSelectUser(u); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                    {u.avatar && u.avatar.startsWith("http") ? (
                      <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      u.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                      {u.name}
                    </p>
                    <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      @{u.username}
                    </p>
                  </div>
                  <MessageSquare size={15} className={isDark ? "text-gray-600" : "text-gray-300"} />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
