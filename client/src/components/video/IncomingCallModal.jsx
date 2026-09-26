import { useEffect, useState } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCall } from "../../context/CallContext";
import { Button, Corners, SignalBars, UserAvatar } from "../ui";

const AUTO_REJECT_SECONDS = 30;

export default function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall } = useCall();

  if (!incomingCall) return null;

  // Keyed so each new call remounts the card with a fresh countdown
  return (
    <IncomingCallCard
      key={incomingCall.callerId}
      call={incomingCall}
      acceptCall={acceptCall}
      rejectCall={rejectCall}
    />
  );
}

function IncomingCallCard({ call, acceptCall, rejectCall }) {
  const [countdown, setCountdown] = useState(AUTO_REJECT_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-reject once the countdown runs out
  useEffect(() => {
    if (countdown === 0) rejectCall("timeout");
  }, [countdown, rejectCall]);

  const { callerName, callerAvatar, callType } = call;
  const isVideo = callType === "video";
  const CallIcon = isVideo ? Video : Phone;

  return (
    <div
      role="alertdialog"
      aria-label={`Incoming ${isVideo ? "video" : "voice"} call from ${callerName}`}
      className="fixed right-4 bottom-20 left-4 z-100 border border-primary/50 bg-popover text-popover-foreground shadow-panel animate-slide-up sm:left-auto sm:w-84 md:right-6 md:bottom-12"
    >
      <Corners />
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="eyebrow flex items-center gap-2 text-primary">
          <CallIcon className="size-3.5" aria-hidden="true" />
          Incoming {isVideo ? "video" : "voice"} call
        </p>
        <span className="eyebrow text-faint tabular-nums" aria-label={`Auto-declines in ${countdown} seconds`}>
          T-{String(countdown).padStart(2, "0")}s
        </span>
      </div>

      <div className="flex items-center gap-3 px-4 py-4">
        <span className="relative">
          <span aria-hidden="true" className="absolute -inset-1.5 animate-ping border border-primary/40" />
          <UserAvatar src={callerAvatar} name={callerName} size="lg" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-extrabold tracking-[0.08em] uppercase">{callerName}</h3>
          <p className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <SignalBars /> Calling you…
          </p>
        </div>
      </div>

      {/* Time left before the call is declined automatically */}
      <div className="h-0.5 bg-border" aria-hidden="true">
        <div
          className="h-full bg-primary transition-[width] duration-1000 ease-linear"
          style={{ width: `${(countdown / AUTO_REJECT_SECONDS) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        <Button variant="destructive" icon={PhoneOff} onClick={() => rejectCall()}>
          Decline
        </Button>
        <Button variant="solid" icon={CallIcon} onClick={() => acceptCall()}>
          Accept
        </Button>
      </div>
    </div>
  );
}
