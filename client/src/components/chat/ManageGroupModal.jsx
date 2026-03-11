import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { X, Search, UserPlus, UserMinus, Crown, LogOut, Loader2, Users } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api.js";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("authToken")}` });

export default function ManageGroupModal({ group, currentUser, onClose, onGroupUpdated }) {
  const { isDark } = useTheme();

  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const searchTimerRef = useRef(null);

  const groupId = group.groupId || group.id;

  // ── Fetch fresh group details ────────────────────────────────────
  const fetchDetails = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/groups/${groupId}`, { headers: authHeader() });
      setMembers(data.group?.members || []);
    } catch {
      setError("Failed to load group details");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  // ── Search users to add ──────────────────────────────────────────
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API_URL}/profile/search?query=${encodeURIComponent(searchQuery)}&limit=8`, { headers: authHeader() });
        const memberIds = new Set(members.map((m) => m.user?._id || m.user));
        setSearchResults((data.users || []).filter((u) => !memberIds.has(u._id)));
      } catch {}
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery, members]);

  // ── Determine current user's role ────────────────────────────────
  const myRole = members.find((m) => {
    const mid = m.user?._id || m.user;
    return mid === currentUser?._id || mid === currentUser?.id;
  })?.role;
  const isAdmin = myRole === "admin";

  // ── Add members ──────────────────────────────────────────────────
  const handleAdd = async (userId) => {
    setActionLoading(`add-${userId}`);
    setError("");
    try {
      await axios.post(`${API_URL}/groups/${groupId}/members`, { userIds: [userId] }, { headers: authHeader() });
      setSearchQuery("");
      setSearchResults([]);
      await fetchDetails();
      onGroupUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setActionLoading("");
    }
  };

  // ── Remove member ────────────────────────────────────────────────
  const handleRemove = async (userId) => {
    setActionLoading(`remove-${userId}`);
    setError("");
    try {
      await axios.delete(`${API_URL}/groups/${groupId}/members/${userId}`, { headers: authHeader() });
      await fetchDetails();
      onGroupUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    } finally {
      setActionLoading("");
    }
  };

  // ── Leave group ──────────────────────────────────────────────────
  const handleLeave = async () => {
    setActionLoading("leave");
    try {
      await axios.delete(`${API_URL}/groups/${groupId}/leave`, { headers: authHeader() });
      onGroupUpdated?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave group");
      setActionLoading("");
    }
  };

  const inputClass = `w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${
    isDark
      ? "bg-white/4 border-white/8 text-white placeholder-gray-600 focus:border-violet-500/60"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:bg-white"
  }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.5)" }}>
      <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDark ? "bg-gray-900 border border-white/8" : "bg-white border border-gray-100"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-base leading-none ${isDark ? "text-white" : "text-gray-900"}`}>Manage Members</h2>
              <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{group.name}</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "hover:bg-white/8 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
            <X size={16} />
          </button>
        </div>

        <div className="h-px mx-6 shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }} />

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5 min-h-0">
          {/* Error */}
          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {/* Current Members */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Members ({members.length})
            </p>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 size={22} className="animate-spin text-violet-500" /></div>
            ) : (
              <div className="flex flex-col gap-1">
                {members.map((m) => {
                  const memberUser = m.user || m;
                  const memberId = memberUser._id || memberUser;
                  const isMe = memberId === currentUser?._id || memberId === currentUser?.id;
                  const isRemoving = actionLoading === `remove-${memberId}`;

                  return (
                    <div
                      key={memberId}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isDark ? "hover:bg-white/4" : "hover:bg-gray-50"}`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {memberUser.avatar && memberUser.avatar.startsWith("http") ? (
                          <img src={memberUser.avatar} alt={memberUser.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                            {memberUser.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                          {memberUser.name || "Unknown"}{isMe ? " (You)" : ""}
                        </p>
                        <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          @{memberUser.username || "—"}
                        </p>
                      </div>

                      {/* Role badge */}
                      {m.role === "admin" && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20 shrink-0">
                          <Crown size={10} /> Admin
                        </span>
                      )}

                      {/* Remove button (admin only, can't remove themselves or other admins) */}
                      {isAdmin && !isMe && m.role !== "admin" && (
                        <button
                          onClick={() => handleRemove(memberId)}
                          disabled={isRemoving}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${isDark ? "text-gray-600 hover:bg-red-500/15 hover:text-red-400" : "text-gray-400 hover:bg-red-50 hover:text-red-500"}`}
                        >
                          {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Members (admin only) */}
          {isAdmin && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Add Members</p>
              <div className={`relative flex items-center rounded-xl border mb-2 ${isDark ? "bg-white/4 border-white/8 focus-within:border-violet-500/40" : "bg-gray-50 border-gray-200 focus-within:border-violet-400"}`}>
                <Search className={`absolute left-3.5 w-4 h-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users to add..."
                  className="flex-1 pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none"
                  style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
                />
              </div>

              {searchResults.length > 0 && (
                <div className={`rounded-xl border overflow-hidden ${isDark ? "border-white/8" : "border-gray-100"}`}>
                  {searchResults.map((u) => {
                    const isAdding = actionLoading === `add-${u._id}`;
                    return (
                      <div key={u._id} className={`flex items-center gap-3 px-3 py-2.5 ${isDark ? "hover:bg-white/4" : "hover:bg-gray-50"}`}>
                        {u.avatar && u.avatar.startsWith("http") ? (
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isDark ? "text-gray-100" : "text-gray-800"}`}>{u.name}</p>
                          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>@{u.username}</p>
                        </div>
                        <button
                          onClick={() => handleAdd(u._id)}
                          disabled={isAdding}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-violet-500 hover:bg-violet-500/15 transition-all shrink-0"
                        >
                          {isAdding ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Leave group button */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          <button
            onClick={handleLeave}
            disabled={actionLoading === "leave"}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${isDark ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" : "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"}`}
          >
            {actionLoading === "leave" ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
}
