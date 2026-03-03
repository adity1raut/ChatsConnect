import { useEffect, useState } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCall } from "../../context/CallContext";

const AUTO_REJECT_SECONDS = 30;

export default function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall } = useCall();
  const [countdown, setCountdown] = useState(AUTO_REJECT_SECONDS);

  // Auto-reject countdown
  useEffect(() => {
    if (!incomingCall) {
      setCountdown(AUTO_REJECT_SECONDS);
      return;
    }

    setCountdown(AUTO_REJECT_SECONDS);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          rejectCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingCall, rejectCall]);

  if (!incomingCall) return null;

  const { callerName, callerAvatar, callType } = incomingCall;
  const isVideo = callType === "video";

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 bg-gradient-to-br from-gray-900 via-gray-950 to-black animate-slide-up">
      {/* Subtle glow ring */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: "inset 0 0 40px rgba(139,92,246,0.15)" }} />

      {/* Animated ring pulse */}
      <div className="absolute top-4 left-4 w-14 h-14 rounded-full bg-violet-500/20 animate-ping" />

      <div className="relative p-5">
        {/* Header */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          {isVideo ? <Video size={12} className="text-violet-400" /> : <Phone size={12} className="text-violet-400" />}
          Incoming {isVideo ? "video" : "audio"} call
        </p>

        {/* Caller info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative shrink-0">
            {callerAvatar && callerAvatar.startsWith("http") ? (
              <img
                src={callerAvatar}
                alt={callerName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-violet-500/50 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-violet-500/50 shadow-lg">
                {callerName?.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Animated outer ring */}
            <div className="absolute -inset-1 rounded-full border-2 border-violet-500/30 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-none mb-1">{callerName}</h3>
            <p className="text-xs text-gray-400">Calling you...</p>
          </div>

          {/* Countdown */}
          <div className="ml-auto shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="rgba(139,92,246,0.7)" strokeWidth="2.5"
                strokeDasharray={`${(countdown / AUTO_REJECT_SECONDS) * 100} 100`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s linear" }}
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-violet-400"
              style={{ marginTop: "-28px", marginLeft: "10px" }}>
              {countdown}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={rejectCall}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 14px rgba(239,68,68,0.35)" }}
          >
            <PhoneOff size={16} />
            Reject
          </button>
          <button
            onClick={acceptCall}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}
          >
            {isVideo ? <Video size={16} /> : <Phone size={16} />}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
