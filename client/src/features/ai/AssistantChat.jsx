import { useEffect, useRef, useState } from "react";
import { Download, MoreVertical, SendHorizontal, Settings2, Trash2, X } from "lucide-react";
import { useAI } from "../../context/AIContext";
import {
  Button,
  Corners,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Markdown,
  Modal,
  StatusDot,
} from "../../components/ui";
import { cn } from "../../lib/utils";
import { downloadTextFile, slugify } from "../../lib/download";
import { toast } from "../../lib/toast";
import AssistantSettingsModal from "./AssistantSettingsModal";
import { STARTER_PROMPTS, buildAssistantMarkdown } from "./assistantOptions";

function Thinking({ avatar }) {
  return (
    <li className="flex items-end gap-2" aria-live="polite">
      <span className="flex size-8 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-base">
        {avatar}
      </span>
      <span className="flex items-center gap-2 border border-l-2 border-border border-l-primary/60 bg-card px-3.5 py-2.5 text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
        Thinking
        <span className="inline-block h-3 w-1.5 bg-primary animate-blink" aria-hidden="true" />
      </span>
    </li>
  );
}

/**
 * Conversation with the user's own assistant. Used as the chat-page side
 * panel (`compact`) and as the full Assistant page.
 */
export default function AssistantChat({ compact = false, onClose }) {
  const { assistant, chatHistory, sendAIMessage, clearChat, isLoading, error } = useAI();
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const name = assistant?.name ?? "Assistant";
  const avatar = assistant?.avatar ?? "🤖";

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatHistory.length, isLoading]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const send = async (text = input) => {
    const message = text.trim();
    if (!message || isLoading) return;
    setInput("");
    const reply = await sendAIMessage(message);
    if (reply === null) setInput(message); // keep it so they can retry
  };

  const exportChat = () => {
    if (!chatHistory.length) return toast({ title: "Nothing to export yet" });
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`assistant-${slugify(name)}-${date}.md`, buildAssistantMarkdown(assistant, chatHistory));
  };

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col bg-card/60"
      aria-label={`Chat with ${name}`}
    >
      <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-xl shadow-[0_0_14px_var(--glow)]">
          {avatar}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xs font-extrabold tracking-[0.1em] uppercase">{name}</h2>
          <p className="eyebrow mt-1 flex items-center gap-1.5 truncate text-faint">
            <StatusDot /> Assistant · private to you
          </p>
        </div>
        <IconButton icon={Settings2} label="Customize assistant" size="sm" onClick={() => setShowSettings(true)} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton icon={MoreVertical} label="More actions" size="sm" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={exportChat}>
              <Download /> Export conversation (.md)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirmClear(true)}>
              <Trash2 /> Clear conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {onClose && <IconButton icon={X} label="Close assistant" size="sm" onClick={onClose} />}
      </header>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-thin" role="log" aria-label="Assistant conversation">
        {chatHistory.length === 0 && !isLoading ? (
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
            <span
              className="relative mb-5 flex size-20 items-center justify-center border border-primary/40 bg-primary/10 text-4xl shadow-[0_0_30px_var(--glow)]"
              aria-hidden="true"
            >
              <Corners />
              {avatar}
            </span>
            <p className="eyebrow text-faint">Session ready</p>
            <h3 className="mt-2 text-lg font-extrabold tracking-[0.08em] uppercase">Hi, I&apos;m {name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Ask me anything — I can draft messages, summarize your chats and look people up.
            </p>
            <div className={cn("mt-6 grid w-full grid-cols-1 border-t border-l border-border", !compact && "sm:grid-cols-2")}>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="group flex gap-2 border-r border-b border-border bg-card px-3 py-3 text-left text-xs text-muted-foreground transition-colors hover:bg-primary/[0.07] hover:text-foreground"
                >
                  <span className="text-primary">&gt;</span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {chatHistory.map((m, i) =>
              m.role === "user" ? (
                <li key={i} className="flex justify-end">
                  <div className="max-w-[85%] border border-r-2 border-primary/35 border-r-primary bg-primary/[0.09] px-3.5 py-2">
                    <Markdown>{m.content}</Markdown>
                  </div>
                </li>
              ) : (
                <li key={i} className="flex items-end gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-base">
                    {avatar}
                  </span>
                  <div className="min-w-0 max-w-[85%] border border-l-2 border-border border-l-border-strong bg-card px-3.5 py-2">
                    <Markdown>{m.content}</Markdown>
                  </div>
                </li>
              ),
            )}
            {isLoading && <Thinking avatar={avatar} />}
          </ul>
        )}
      </div>

      {error && (
        <p role="alert" className="shrink-0 border-t border-destructive/40 bg-destructive/[0.07] px-4 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="shrink-0 border-t border-border p-3"
      >
        <div className="flex items-end gap-2 border border-border-strong bg-background p-1.5 pl-3 transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_1px_var(--primary),0_0_24px_var(--glow)]">
          <span aria-hidden="true" className="self-center pb-px text-sm font-bold text-primary">
            &gt;
          </span>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            maxLength={4000}
            placeholder={`Message ${name}…`}
            aria-label={`Message ${name}`}
            className="max-h-36 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm text-foreground caret-primary outline-none placeholder:text-faint"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send to assistant"
            className="flex size-9 shrink-0 items-center justify-center border border-primary bg-primary text-primary-foreground transition-[background-color,box-shadow] hover:bg-primary/90 hover:glow disabled:border-border-strong disabled:bg-transparent disabled:text-faint"
          >
            <SendHorizontal className="size-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      {showSettings && <AssistantSettingsModal onClose={() => setShowSettings(false)} />}
      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear this conversation?"
        description={`${name} will forget everything you've talked about.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearChat();
                setConfirmClear(false);
              }}
            >
              Clear
            </Button>
          </>
        }
      />
    </section>
  );
}
