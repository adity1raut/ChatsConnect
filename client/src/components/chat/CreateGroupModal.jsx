import { useState, useEffect, useCallback } from "react";
import { X, Search, Users, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

import { API_URL as API } from "../../config/api.js";

export default function CreateGroupModal({ onClose, onGroupCreated }) {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1); // 1=name+desc, 2=add members
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const searchUsers = useCallback(async (q) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        `${API}/profile/search?query=${encodeURIComponent(q)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSearchResults(res.data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(search), 300);
    return () => clearTimeout(t);
  }, [search, searchUsers]);

  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user],
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        `${API}/groups`,
        {
          name: groupName.trim(),
          description: description.trim(),
          memberIds: selectedUsers.map((u) => u._id),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onGroupCreated(res.data.group);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const base = isDark
    ? "bg-gray-900 border-white/10 text-white"
    : "bg-white border-gray-200 text-gray-900";

  const inputBase = isDark
    ? "bg-white/[0.04] border-white/10 text-white placeholder-gray-600 focus:border-violet-500/50"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl ${base}`}>
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users size={14} className="text-white" />
            </div>
            <h2 className="font-bold text-base">New Group</h2>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "hover:bg-white/8 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Name & Description */}
        {step === 1 && (
          <div className="p-5 space-y-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                GROUP NAME *
              </label>
              <input
                autoFocus
                type="text"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Team Alpha"
                maxLength={60}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors ${inputBase}`}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                DESCRIPTION (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this group about?"
                rows={2}
                maxLength={200}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm resize-none transition-colors ${inputBase}`}
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${isDark ? "bg-white/[0.04] text-gray-400 hover:bg-white/8" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!groupName.trim()) {
                    setError("Group name is required");
                    return;
                  }
                  setStep(2);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                }}
              >
                Next: Add Members
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Members */}
        {step === 2 && (
          <div className="p-5 space-y-3">
            {/* Selected chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                    }}
                  >
                    {u.name}
                    <button onClick={() => toggleUser(u)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input */}
            <div
              className={`relative flex items-center rounded-xl border ${isDark ? "bg-white/[0.04] border-white/10" : "bg-gray-50 border-gray-200"}`}
            >
              {loading ? (
                <Loader2
                  size={15}
                  className="absolute left-3.5 text-gray-500 animate-spin"
                />
              ) : (
                <Search size={15} className="absolute left-3.5 text-gray-500" />
              )}
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people to add..."
                className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none"
                style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
              />
            </div>

            {/* Results */}
            <div
              className={`rounded-xl border max-h-48 overflow-y-auto ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}
            >
              {searchResults.length === 0 && search.trim() ? (
                <p
                  className={`text-center py-6 text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}
                >
                  No users found
                </p>
              ) : searchResults.length === 0 ? (
                <p
                  className={`text-center py-6 text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}
                >
                  Search to add members
                </p>
              ) : (
                searchResults.map((u) => {
                  const isSelected = selectedUsers.some((s) => s._id === u._id);
                  return (
                    <button
                      key={u._id}
                      onClick={() => toggleUser(u)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                        isSelected
                          ? isDark
                            ? "bg-violet-500/15"
                            : "bg-violet-50"
                          : isDark
                            ? "hover:bg-white/[0.04]"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          u.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${isDark ? "text-gray-100" : "text-gray-800"}`}
                        >
                          {u.name}
                        </p>
                        <p
                          className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}
                        >
                          @{u.username}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex justify-between gap-2 pt-1">
              <button
                onClick={() => setStep(1)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${isDark ? "bg-white/[0.04] text-gray-400 hover:bg-white/8" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                }}
              >
                {creating && <Loader2 size={13} className="animate-spin" />}
                Create Group
                {selectedUsers.length > 0
                  ? ` (${selectedUsers.length + 1})`
                  : ""}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
