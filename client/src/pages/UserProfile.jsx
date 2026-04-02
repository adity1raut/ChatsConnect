import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MessageSquare,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Users,
  AtSign,
  Calendar,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useFriends } from "../context/FriendContext";
import { API_URL } from "../config/api.js";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user: me } = useAuth();
  const {
    friends,
    incomingRequests,
    sentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeFriend,
    getRelationship,
  } = useFriends();

  const [profile, setProfile] = useState(null);
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/profile/${userId}`, {
          headers: authHeader(),
        });
        setProfile(data.user);
        setFriendCount(data.friendCount ?? 0);
      } catch {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const rel = getRelationship(userId);

  const handleSendRequest = async () => {
    setActionLoading(true);
    try {
      await sendRequest(userId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    const req = incomingRequests.find((r) => r.sender._id === userId);
    if (!req) return;
    setActionLoading(true);
    try {
      await acceptRequest(req._id, userId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const req = sentRequests.find((r) => r.receiver._id === userId);
    if (!req) return;
    setActionLoading(true);
    try {
      await cancelRequest(req._id, userId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    setActionLoading(true);
    try {
      await removeFriend(userId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    navigate("/chat", {
      state: {
        openChat: {
          id: profile._id,
          name: profile.name,
          username: profile.username,
          avatar: profile.avatar,
        },
      },
    });
  };

  if (loading) {
    return (
      <div
        className={`min-h-[100dvh] flex items-center justify-center ${isDark ? "bg-[#0a0a14]" : "bg-[#f4f5ff]"}`}
      >
        <Loader2 size={32} className="animate-spin text-violet-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        className={`min-h-[100dvh] flex flex-col items-center justify-center gap-4 ${isDark ? "bg-[#0a0a14] text-white" : "bg-[#f4f5ff] text-gray-900"}`}
      >
        <p className="text-lg font-semibold">{error || "User not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-violet-500 hover:underline text-sm flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  const isMe = me?._id === userId || me?.id === userId;
  const isFriend = rel.status === "friends";
  const isPending = rel.status === "sent";
  const hasIncoming = rel.status === "received";

  return (
    <div
      className={`min-h-[100dvh] relative overflow-hidden transition-all duration-700 ${isDark ? "bg-[#0a0a14] text-gray-50" : "bg-[#f4f5ff] text-gray-900"}`}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse at top left, rgba(139,92,246,0.2) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(236,72,153,0.15) 0%, transparent 50%)"
              : "radial-gradient(ellipse at top left, rgba(167,139,250,0.3) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(244,114,182,0.2) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm font-semibold mb-6 px-3 py-2 rounded-xl transition-all ${isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-white"}`}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Profile card */}
        <div
          className={`rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden ${isDark ? "bg-gray-900/70 border border-white/5" : "bg-white/80 border border-white/80"}`}
        >
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

          {/* Cover gradient */}
          <div
            className="h-28 w-full"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
              opacity: 0.85,
            }}
          />

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                <div className="absolute inset-[-3px] rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-blue-500" />
                <div
                  className={`absolute inset-[-1px] rounded-full ${isDark ? "bg-gray-900" : "bg-white"}`}
                />
                {profile.avatar && profile.avatar.startsWith("http") ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="relative z-10 w-24 h-24 rounded-full object-cover block"
                  />
                ) : (
                  <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Online dot */}
                <div
                  className={`absolute bottom-1 right-1 z-20 w-4 h-4 rounded-full border-2 ${profile.isOnline ? "bg-emerald-500" : "bg-gray-400"} ${isDark ? "border-gray-900" : "border-white"}`}
                />
              </div>

              {/* Action buttons */}
              {!isMe && (
                <div className="flex gap-2 flex-wrap justify-end">
                  {/* Friend button */}
                  {isFriend ? (
                    <button
                      onClick={handleRemove}
                      disabled={actionLoading}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isDark ? "bg-white/6 text-gray-300 hover:bg-red-500/20 hover:text-red-400 border border-white/8" : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 border border-gray-200"}`}
                    >
                      <UserCheck size={14} /> Friends
                    </button>
                  ) : hasIncoming ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                        style={{
                          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                        }}
                      >
                        <UserPlus size={14} /> Accept
                      </button>
                      <button
                        onClick={() => {
                          const req = incomingRequests.find(
                            (r) => r.sender._id === userId,
                          );
                          if (req) rejectRequest(req._id, userId);
                        }}
                        disabled={actionLoading}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${isDark ? "bg-white/6 text-gray-400 border border-white/8 hover:bg-red-500/15 hover:text-red-400" : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"}`}
                      >
                        <UserX size={14} />
                      </button>
                    </div>
                  ) : isPending ? (
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isDark ? "bg-violet-500/15 text-violet-400 border border-violet-500/25 hover:bg-red-500/15 hover:text-red-400" : "bg-violet-50 text-violet-600 hover:bg-red-50 hover:text-red-500 border border-violet-200"}`}
                    >
                      <Clock size={14} /> Pending
                    </button>
                  ) : (
                    <button
                      onClick={handleSendRequest}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 shadow-md"
                      style={{
                        background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                      }}
                    >
                      <UserPlus size={14} /> Add Friend
                    </button>
                  )}

                  {/* Message button */}
                  <button
                    onClick={handleMessage}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 ${isDark ? "bg-white/6 text-gray-300 border border-white/8 hover:bg-violet-500/15 hover:text-violet-400" : "bg-gray-100 text-gray-700 hover:bg-violet-50 hover:text-violet-600 border border-gray-200"}`}
                  >
                    <MessageSquare size={14} /> Message
                  </button>
                </div>
              )}

              {isMe && (
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 shadow-md"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Name + username */}
            <div className="mb-4">
              <h1
                className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {profile.name}
              </h1>
              <p
                className={`flex items-center gap-1 text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                <AtSign size={13} strokeWidth={2.5} />
                {profile.username}
              </p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p
                className={`text-sm leading-relaxed mb-5 italic ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                "{profile.bio}"
              </p>
            )}

            {/* Stats row */}
            <div
              className={`flex gap-4 py-4 border-y ${isDark ? "border-white/6" : "border-gray-100"}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-violet-500/15" : "bg-violet-50"}`}
                >
                  <Users size={16} className="text-violet-500" />
                </div>
                <div>
                  <p
                    className={`text-lg font-bold leading-none ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {friendCount}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Friends
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${profile.isOnline ? (isDark ? "bg-emerald-500/15" : "bg-emerald-50") : isDark ? "bg-white/4" : "bg-gray-100"}`}
                >
                  {profile.isOnline ? (
                    <Wifi size={16} className="text-emerald-500" />
                  ) : (
                    <WifiOff
                      size={16}
                      className={isDark ? "text-gray-500" : "text-gray-400"}
                    />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-bold leading-none ${profile.isOnline ? "text-emerald-500" : isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {profile.isOnline ? "Online" : "Offline"}
                  </p>
                  {!profile.isOnline && profile.lastSeen && (
                    <p
                      className={`text-xs mt-0.5 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                    >
                      {new Date(profile.lastSeen).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-blue-500/15" : "bg-blue-50"}`}
                >
                  <Calendar size={16} className="text-blue-500" />
                </div>
                <div>
                  <p
                    className={`text-sm font-bold leading-none ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" },
                        )
                      : "—"}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Joined
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
