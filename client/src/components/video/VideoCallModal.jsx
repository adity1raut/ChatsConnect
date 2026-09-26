import { useEffect, useRef } from "react";
import { Loader2, Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useCall } from "../../context/CallContext";
import { cn } from "../../lib/utils";
import { StatusDot, UserAvatar } from "../ui";

export default function VideoCallModal() {
  const {
    activeCall,
    isConnecting,
    isMuted,
    isCameraOff,
    localStreamRef,
    remoteStreamRef,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [activeCall, localStreamRef]);

  // Attach remote stream whenever it arrives (_ts triggers re-render)
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [activeCall, remoteStreamRef]);

  if (!activeCall) return null;

  const { peerName, peerAvatar, isAudio } = activeCall;
  const status = isConnecting ? "Connecting" : isAudio ? "Voice.Live" : "Video.Live";

  // `dark` pins the call screen to the dark palette whatever the app theme is
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Call with ${peerName}`}
      className="dark fixed inset-0 z-200 flex items-center justify-center bg-black text-foreground"
    >
      <div className="relative flex h-full w-full items-center justify-center bg-grid">
        {isAudio || isConnecting ? (
          <div className="flex flex-col items-center gap-6 select-none">
            <span className="relative">
              <span aria-hidden="true" className="absolute -inset-3 animate-ping border border-primary/30" />
              <span aria-hidden="true" className="absolute -inset-1.5 border border-primary/50" />
              <UserAvatar src={peerAvatar} name={peerName} size="2xl" />
            </span>
            <div className="text-center">
              <h2 className="text-xl font-extrabold tracking-[0.12em] uppercase">{peerName}</h2>
              <p className="eyebrow mt-3 flex items-center justify-center gap-2 text-primary">
                {isConnecting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> Connecting…
                  </>
                ) : (
                  <>
                    <StatusDot pulse /> {isAudio ? "Voice call" : "Connected"}
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
        )}

        {/* Your camera, picture-in-picture (video calls only) */}
        {!isAudio && (
          <div className="absolute right-4 bottom-28 h-28 w-40 overflow-hidden border border-primary/50 bg-card shadow-panel sm:right-6">
            {isCameraOff ? (
              <div className="flex h-full w-full items-center justify-center">
                <VideoOff className="size-5 text-faint" aria-hidden="true" />
              </div>
            ) : (
              <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full scale-x-[-1] object-cover" />
            )}
            <span className="eyebrow absolute bottom-1.5 left-2 text-white/70">You</span>
          </div>
        )}

        {/* Session header */}
        <div className="absolute top-4 left-4 flex items-center gap-3 border border-border-strong bg-black/60 py-2 pr-4 pl-2 backdrop-blur-sm sm:top-6 sm:left-6">
          <UserAvatar src={peerAvatar} name={peerName} size="sm" />
          <div>
            <p className="text-xs font-bold tracking-[0.1em] uppercase">{peerName}</p>
            <p className="eyebrow mt-1 flex items-center gap-1.5 text-faint">
              <StatusDot tone={isConnecting ? "warning" : "success"} pulse={isConnecting} />
              {status}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 border border-border-strong bg-black/60 p-2 backdrop-blur-sm sm:bottom-8">
          <CallControl
            label={isMuted ? "Unmute" : "Mute"}
            icon={isMuted ? MicOff : Mic}
            active={isMuted}
            onClick={toggleMute}
          />
          <button
            type="button"
            onClick={endCall}
            aria-label="End call"
            title="End call"
            className="flex h-12 items-center gap-2 border border-destructive bg-destructive px-5 text-[11px] font-bold tracking-[0.12em] text-white uppercase transition-[box-shadow,background-color] hover:bg-destructive/85 hover:shadow-[0_0_24px_rgb(255_105_120/0.45)]"
          >
            <PhoneOff className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">End</span>
          </button>
          {!isAudio && (
            <CallControl
              label={isCameraOff ? "Turn on camera" : "Turn off camera"}
              icon={isCameraOff ? VideoOff : Video}
              active={isCameraOff}
              onClick={toggleCamera}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Square toggle for the call bar; `active` marks the "off" state (muted, camera off)
export function CallControl({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex size-12 items-center justify-center border transition-colors",
        active
          ? "border-destructive/70 bg-destructive/20 text-destructive"
          : "border-border-strong bg-white/5 text-foreground hover:border-primary/60 hover:text-primary",
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}
