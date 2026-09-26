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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  UserAvatar,
} from "../../components/ui";
import { cn } from "../../lib/utils";

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
    <header className="relative z-20 flex shrink-0 items-center gap-2 border-b border-border bg-card/80 px-2 py-2 backdrop-blur-md sm:px-4">
      <IconButton icon={ArrowLeft} label="Back to conversations" size="sm" className="md:hidden" onClick={onBack} />

      <button
        type="button"
        onClick={isGroup ? onManageGroup : onViewProfile}
        className="flex min-w-0 flex-1 items-center gap-3 border border-transparent p-1 text-left hover:border-border hover:bg-accent"
      >
        <UserAvatar
          src={chat.avatar}
          name={chat.name}
          size="md"
          online={!isGroup && isPeerOnline}
        />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 truncate text-xs font-extrabold tracking-[0.06em] uppercase">
            <span className="truncate">{chat.name}</span>
            {encrypted && (
              <span className="inline-flex items-center gap-1 border border-primary/40 bg-primary/10 px-1 py-px text-[9px] tracking-[0.12em] text-primary">
                <Lock className="size-2.5" aria-hidden="true" />
                E2EE
                <span className="sr-only">End-to-end encrypted</span>
              </span>
            )}
          </span>
          <span
            className={cn(
              "mt-0.5 block truncate text-[11px]",
              status.tone === "accent" && "text-primary",
              status.tone === "online" && "text-success",
              status.tone === "muted" && "text-muted-foreground",
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
        <IconButton
          icon={Bot}
          label={aiPanelOpen ? "Hide assistant" : "Ask your assistant"}
          active={aiPanelOpen}
          className="hidden lg:inline-flex"
          onClick={onToggleAI}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton icon={MoreVertical} label="More options" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isGroup ? (
              <DropdownMenuItem onSelect={onManageGroup}>
                <Settings2 /> Manage group
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={onViewProfile}>
                <UserRound /> View profile
              </DropdownMenuItem>
            )}
            {encrypted && (
              <DropdownMenuItem onSelect={onVerify}>
                <ShieldCheck /> Verify security code
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={onExport}>
              <Download /> Export chat (.md)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
