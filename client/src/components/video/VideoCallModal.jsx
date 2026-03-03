import { useEffect, useRef } from "react";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Phone,
} from "lucide-react";
import { useCall } from "../../context/CallContext";

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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Remote video / audio-only placeholder */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isAudio || isConnecting ? (
          /* Audio call or still connecting: show avatar */
          <div className="flex flex-col items-center gap-6 select-none">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping scale-125" />
              {peerAvatar && peerAvatar.startsWith("http") ? (
                <img
                  src={peerAvatar}
                  alt={peerName}
                  className="relative w-40 h-40 rounded-full object-cover ring-4 ring-violet-500/40 shadow-2xl"
                />
              ) : (
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-6xl ring-4 ring-violet-500/40 shadow-2xl">
                  {peerName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{peerName}</h2>
              {isConnecting ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Connecting...</span>
                </div>
              ) : (
                <p className="text-emerald-400 text-sm font-medium flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isAudio ? "Audio call" : "Connected"}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Video call — remote stream fills screen */
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Local video PIP (bottom-right) — only for video calls */}
        {!isAudio && (
          <div className="absolute bottom-24 right-6 w-40 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-900">
            {isCameraOff ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <VideoOff size={20} className="text-gray-500" />
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]" // mirror local
              />
            )}
            <div className="absolute bottom-1.5 left-2 text-[10px] text-white/60 font-medium">You</div>
          </div>
        )}

        {/* Peer name overlay (top-left) */}
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-2xl">
          {peerAvatar && peerAvatar.startsWith("http") ? (
            <img src={peerAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              {peerName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm leading-none">{peerName}</p>
            {!isConnecting && (
              <p className="text-emerald-400 text-[10px] font-medium mt-0.5">
                {isAudio ? "Audio call" : "HD video"}
              </p>
            )}
          </div>
        </div>

        {/* Control bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          {/* Mic toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg ${
              isMuted
                ? "bg-red-500/90 text-white"
                : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
            }`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            title="End call"
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 6px 20px rgba(239,68,68,0.45)" }}
          >
            {activeCall.isAudio ? <PhoneOff size={24} className="text-white" /> : <PhoneOff size={24} className="text-white" />}
          </button>

          {/* Camera toggle — only for video calls */}
          {!isAudio && (
            <button
              onClick={toggleCamera}
              title={isCameraOff ? "Turn on camera" : "Turn off camera"}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg ${
                isCameraOff
                  ? "bg-red-500/90 text-white"
                  : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
              }`}
            >
              {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
