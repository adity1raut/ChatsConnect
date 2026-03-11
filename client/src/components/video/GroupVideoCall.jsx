import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Maximize2, Minimize2 } from "lucide-react";
import { useGroupCall } from "../../context/GroupCallContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Single video tile for one participant
function VideoTile({ stream, name, avatar, isMuted: tileIsMuted, isLocal = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream?.getVideoTracks().some((t) => t.enabled && t.readyState === "live");

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center group">
      {stream && hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          {avatar && avatar.startsWith("http") ? (
            <img src={avatar} alt={name} className="w-16 h-16 rounded-full object-cover ring-4 ring-violet-500/40" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-violet-500/40">
              {name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-white text-xs font-medium opacity-70">{isLocal ? "You (camera off)" : "Camera off"}</span>
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
        <span className="text-white text-xs font-semibold">{isLocal ? `${name} (You)` : name}</span>
        {tileIsMuted && <MicOff size={11} className="text-red-400" />}
      </div>
    </div>
  );
}

// Incoming group call notification banner
function IncomingGroupCallBanner({ call, onJoin, onDismiss }) {
  const { isDark } = useTheme();

  return (
    <div className={`fixed top-4 right-4 z-[200] w-80 rounded-2xl shadow-2xl border p-4 ${isDark ? "bg-gray-900/95 border-white/10 text-white" : "bg-white/95 border-gray-200 text-gray-900"}`}
      style={{ backdropFilter: "blur(20px)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
          <Users size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Group Call</p>
          <p className="text-sm font-bold truncate">{call.callerName} started a call</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onJoin}
          className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}
        >
          Join
        </button>
        <button
          onClick={onDismiss}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${isDark ? "bg-white/8 text-gray-300 hover:bg-white/15" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Ignore
        </button>
      </div>
    </div>
  );
}

export default function GroupVideoCall() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const {
    activeGroupCall, incomingGroupCall, participants,
    localStreamRef, isMuted, isCameraOff,
    leaveGroupCall, toggleMute, toggleCamera,
    joinGroupCall, dismissIncoming,
  } = useGroupCall();

  const localVideoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [activeGroupCall, localStreamRef]);

  if (!activeGroupCall && !incomingGroupCall) return null;

  // Build participant tiles (remote only)
  const remoteTiles = [...participants.entries()];
  const totalTiles = remoteTiles.length + 1; // +1 for local

  // Grid layout based on count
  const gridClass =
    totalTiles === 1 ? "grid-cols-1" :
    totalTiles === 2 ? "grid-cols-2" :
    totalTiles <= 4 ? "grid-cols-2" :
    totalTiles <= 6 ? "grid-cols-3" : "grid-cols-3";

  const tileHeight =
    totalTiles <= 2 ? "h-full" :
    totalTiles <= 4 ? "h-1/2" : "h-1/3";

  return (
    <>
      {/* Incoming notification */}
      {incomingGroupCall && !activeGroupCall && (
        <IncomingGroupCallBanner
          call={incomingGroupCall}
          onJoin={() => joinGroupCall(incomingGroupCall.groupId, incomingGroupCall.groupName || "Group", incomingGroupCall.callType)}
          onDismiss={dismissIncoming}
        />
      )}

      {/* Active call overlay */}
      {activeGroupCall && (
        <div
          className={`fixed inset-0 z-[150] bg-gray-950 flex flex-col ${isFullscreen ? "" : "p-4"}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Users size={15} className="text-violet-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">{activeGroupCall.groupName}</p>
                <p className="text-gray-500 text-xs mt-0.5">{participants.size + 1} participant{participants.size !== 0 ? "s" : ""}</p>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen((v) => !v)}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>

          {/* Video grid */}
          <div className={`flex-1 grid gap-2 ${gridClass} min-h-0`}>
            {/* Local tile */}
            <div className={tileHeight}>
              <VideoTile
                stream={localStreamRef.current}
                name={user?.name}
                avatar={user?.avatar}
                isMuted={isMuted}
                isLocal
              />
            </div>

            {/* Remote tiles */}
            {remoteTiles.map(([uid, info]) => (
              <div key={uid} className={tileHeight}>
                <VideoTile
                  stream={info.stream}
                  name={info.name}
                  avatar={info.avatar}
                  isMuted={false}
                />
              </div>
            ))}
          </div>

          {/* Control bar */}
          <div className="flex items-center justify-center gap-4 py-4 shrink-0">
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <button
              onClick={toggleCamera}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg ${isCameraOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>

            <button
              onClick={leaveGroupCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
