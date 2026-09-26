import { useEffect, useRef, useState } from "react";
import { Maximize2, Mic, MicOff, Minimize2, PhoneOff, Users, Video, VideoOff } from "lucide-react";
import { useGroupCall } from "../../context/GroupCallContext";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { Button, Corners, StatusDot, UserAvatar } from "../ui";
import { CallControl } from "./VideoCallModal";

// Single video tile for one participant
function VideoTile({
  stream,
  name,
  avatar,
  isMuted: tileIsMuted,
  isLocal = false,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream
    ?.getVideoTracks()
    .some((t) => t.enabled && t.readyState === "live");

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden border border-border-strong bg-card">
      {stream && hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn("h-full w-full object-cover", isLocal && "scale-x-[-1]")}
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <UserAvatar src={avatar} name={name} size="lg" />
          <span className="eyebrow text-faint">{isLocal ? "You · camera off" : "Camera off"}</span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 border border-border-strong bg-black/60 px-2 py-1 backdrop-blur-sm">
        <span className="text-[10px] font-bold tracking-[0.1em] text-white uppercase">{isLocal ? `${name} (you)` : name}</span>
        {tileIsMuted && <MicOff className="size-3 text-destructive" aria-label="Muted" />}
      </div>
    </div>
  );
}

// Incoming group call notification banner
function IncomingGroupCallBanner({ call, onJoin, onDismiss }) {
  return (
    <div
      role="alertdialog"
      aria-label={`${call.callerName} started a group call`}
      className="fixed top-4 right-4 left-4 z-200 border border-primary/50 bg-popover text-popover-foreground shadow-panel animate-slide-up sm:left-auto sm:w-84"
    >
      <Corners />
      <div className="flex items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
          <Users className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-primary">Group call</p>
          <p className="mt-1 truncate text-xs font-bold">{call.callerName} started a call</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
        <Button variant="ghost" onClick={onDismiss}>
          Ignore
        </Button>
        <Button variant="solid" icon={Video} onClick={onJoin}>
          Join
        </Button>
      </div>
    </div>
  );
}

export default function GroupVideoCall() {
  const { user } = useAuth();
  const {
    activeGroupCall,
    incomingGroupCall,
    participants,
    localStream,
    isMuted,
    isCameraOff,
    leaveGroupCall,
    toggleMute,
    toggleCamera,
    joinGroupCall,
    dismissIncoming,
  } = useGroupCall();

  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!activeGroupCall && !incomingGroupCall) return null;

  // Build participant tiles (remote only)
  const remoteTiles = [...participants.entries()];
  const totalTiles = remoteTiles.length + 1; // +1 for local

  // Grid layout based on count
  const gridClass =
    totalTiles === 1
      ? "grid-cols-1"
      : totalTiles === 2
        ? "grid-cols-2"
        : totalTiles <= 4
          ? "grid-cols-2"
          : totalTiles <= 6
            ? "grid-cols-3"
            : "grid-cols-3";

  const tileHeight =
    totalTiles <= 2 ? "h-full" : totalTiles <= 4 ? "h-1/2" : "h-1/3";

  return (
    <>
      {/* Incoming notification */}
      {incomingGroupCall && !activeGroupCall && (
        <IncomingGroupCallBanner
          call={incomingGroupCall}
          onJoin={() =>
            joinGroupCall(
              incomingGroupCall.groupId,
              incomingGroupCall.groupName || "Group",
              incomingGroupCall.callType,
            )
          }
          onDismiss={dismissIncoming}
        />
      )}

      {/* Active call overlay — `dark` keeps it on the dark palette in either theme */}
      {activeGroupCall && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Group call in ${activeGroupCall.groupName}`}
          className={cn("dark fixed inset-0 z-150 flex flex-col bg-black text-foreground", !isFullscreen && "p-3 sm:p-4")}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex shrink-0 items-center justify-between border border-border-strong bg-card px-3 py-2">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                <Users className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.1em] uppercase">{activeGroupCall.groupName}</p>
                <p className="eyebrow mt-1 flex items-center gap-1.5 text-faint">
                  <StatusDot pulse /> {participants.size + 1} participant{participants.size !== 0 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
              title={isFullscreen ? "Exit full screen" : "Full screen"}
              className="flex size-8 items-center justify-center border border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          </div>

          <div className={cn("mt-2 grid min-h-0 flex-1 gap-2", gridClass)}>
            <div className={tileHeight}>
              <VideoTile stream={localStream} name={user?.name} avatar={user?.avatar} isMuted={isMuted} isLocal />
            </div>
            {remoteTiles.map(([uid, info]) => (
              <div key={uid} className={tileHeight}>
                <VideoTile stream={info.stream} name={info.name} avatar={info.avatar} isMuted={false} />
              </div>
            ))}
          </div>

          <div className="flex shrink-0 justify-center py-4">
            <div className="flex items-center gap-3 border border-border-strong bg-card p-2">
              <CallControl label={isMuted ? "Unmute" : "Mute"} icon={isMuted ? MicOff : Mic} active={isMuted} onClick={toggleMute} />
              <CallControl
                label={isCameraOff ? "Turn on camera" : "Turn off camera"}
                icon={isCameraOff ? VideoOff : Video}
                active={isCameraOff}
                onClick={toggleCamera}
              />
              <button
                type="button"
                onClick={leaveGroupCall}
                aria-label="Leave call"
                title="Leave call"
                className="flex h-12 items-center gap-2 border border-destructive bg-destructive px-5 text-[11px] font-bold tracking-[0.12em] text-white uppercase transition-[box-shadow,background-color] hover:bg-destructive/85 hover:shadow-[0_0_24px_rgb(255_105_120/0.45)]"
              >
                <PhoneOff className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
