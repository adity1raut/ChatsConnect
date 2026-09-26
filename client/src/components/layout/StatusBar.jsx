import { useSocket } from "../../context/SocketContext";
import { useE2EE } from "../../context/E2EEContext";
import { SignalBars, StatusDot } from "../ui";
import { cn } from "../../lib/utils";

const E2EE_LABEL = {
  ready: ["E2EE.ON", "success"],
  locked: ["E2EE.LOCKED", "warning"],
  none: ["E2EE.OFF", "idle"],
  error: ["E2EE.ERROR", "danger"],
};

// Live connection + encryption status along the bottom edge (desktop)
export default function StatusBar({ className }) {
  const { isConnected } = useSocket();
  const { status } = useE2EE();
  const [e2eeLabel, e2eeTone] = E2EE_LABEL[status] ?? ["E2EE.…", "idle"];

  return (
    <footer
      className={cn(
        "h-8 shrink-0 items-center justify-between gap-6 border-t border-border bg-sidebar px-5 text-[10px] font-bold tracking-[0.14em] text-faint uppercase",
        className,
      )}
    >
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-2" role="status">
          <StatusDot tone={isConnected ? "success" : "danger"} pulse={!isConnected} />
          {isConnected ? "Link.Online" : "Link.Reconnecting"}
        </span>
        <SignalBars active={isConnected} />
        <span className="flex items-center gap-2">
          <StatusDot tone={e2eeTone} />
          {e2eeLabel}
        </span>
      </div>
      <span>ChatsConnect · v2.0</span>
    </footer>
  );
}
