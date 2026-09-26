import {
  ArrowLeft,
  Bot,
  Download,
  Lock,
  MoreVertical,
  Phone,
  Settings2,
  ShieldCheck,
  UserRound,
  Video,
} from "lucide-react";
import { Avatar, IconButton } from "../../components/ui";
import Menu from "../../components/ui/Menu";
import { cn } from "../../lib/cn";

function statusLine(chat, { typingNames, isPeerOnline }) {
  if (typingNames.length) {
    if (chat.type === "user") return { text: "typing…", tone: "accent" };
    const who =
      typingNames.length === 1
        ? typingNames[0]
        : `${typingNames.length} people`;
    return { text: `${who} ${typingNames.length === 1 ? "is" : "are"} typing…`, tone: "accent" };
  }
  if (chat.type === "group") {
    const count = chat.memberCount ?? chat.members?.length ?? 0;
    return { text: `${count} member${count === 1 ? "" : "s"}`, tone: "muted" };
  }
  return isPeerOnline ? { text: "Online", tone: "online" } : { text: `@${chat.username ?? ""}`, tone: "muted" };
}

export default function ChatHeader({
  chat,
  typingNames,
  isPeerOnline,
  aiEnabled,
  aiPanelOpen,
  onBack,
  onVoiceCall,
  onVideoCall,
  onGroupCall,
  onToggleAI,
  onViewProfile,
  onManageGroup,
  onExport,
  encrypted,
  onVerify,
}) {
  const isGroup = chat.type === "group";
  const status = statusLine(chat, { typingNames, isPeerOnline });

  return (
    <header className="relative z-20 flex shrink-0 items-center gap-2 border-b border-line bg-surface/90 px-2 py-2.5 backdrop-blur-xl sm:px-4">
      <IconButton icon={ArrowLeft} label="Back to conversations" size="sm" className="md:hidden" onClick={onBack} />

      <button
        type="button"
        onClick={isGroup ? onManageGroup : onViewProfile}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left hover:bg-surface-2"
      >
        <Avatar
          src={chat.avatar}
          name={chat.name}
          size="md"
          shape={isGroup ? "square" : "circle"}
          online={!isGroup && isPeerOnline}
        />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 truncate text-sm font-bold">
            <span className="truncate">{chat.name}</span>
            {encrypted && (
              <Lock
                className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-label="End-to-end encrypted"
              />
            )}
          </span>
          <span
            className={cn(
              "block truncate text-xs",
              status.tone === "accent" && "font-medium text-accent-fg",
              status.tone === "online" && "text-emerald-600 dark:text-emerald-400",
              status.tone === "muted" && "text-muted",
            )}
          >
            {status.text}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        {isGroup ? (
          <IconButton icon={Video} label="Start group call" onClick={onGroupCall} />
        ) : (
          <>
            <IconButton icon={Phone} label="Voice call" onClick={onVoiceCall} />
            <IconButton icon={Video} label="Video call" onClick={onVideoCall} />
          </>
        )}
        {aiEnabled && (
          <IconButton
            icon={Bot}
            label={aiPanelOpen ? "Hide AI assistant" : "Show AI assistant"}
            active={aiPanelOpen}
            className="hidden lg:inline-flex"
            onClick={onToggleAI}
          />
        )}
        <Menu
          trigger={(props) => <IconButton icon={MoreVertical} label="More options" {...props} />}
          items={[
            isGroup
              ? { label: "Manage group", icon: Settings2, onSelect: onManageGroup }
              : { label: "View profile", icon: UserRound, onSelect: onViewProfile },
            encrypted && { label: "Verify security code", icon: ShieldCheck, onSelect: onVerify },
            { label: "Export chat (.md)", icon: Download, onSelect: onExport },
          ]}
        />
      </div>
    </header>
  );
}
