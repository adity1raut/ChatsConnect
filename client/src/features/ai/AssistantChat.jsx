import { useEffect, useRef, useState } from "react";
import { Download, MoreVertical, SendHorizontal, Settings2, Trash2, X } from "lucide-react";
import { useAI } from "../../context/AIContext";
import { IconButton, Markdown, Modal, Button } from "../../components/ui";
import Menu from "../../components/ui/Menu";
import { cn } from "../../lib/cn";
import { downloadTextFile, slugify } from "../../lib/download";
import { toast } from "../../lib/toast";
import AssistantSettingsModal from "./AssistantSettingsModal";
import { STARTER_PROMPTS, buildAssistantMarkdown } from "./assistantOptions";

function Thinking({ avatar }) {
  return (
    <li className="flex items-end gap-2" aria-live="polite">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base">
        {avatar}
      </span>
      <span className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3">
        <span className="sr-only">Thinking</span>
        {[0, 150, 300].map((d) => (
          <span key={d} className="size-1.5 animate-bounce rounded-full bg-subtle" style={{ animationDelay: `${d}ms` }} />
        ))}
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
      className={cn("flex h-full min-h-0 w-full flex-col bg-surface", compact && "border-l border-line")}
      aria-label={`Chat with ${name}`}
    >
      <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-line px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-xl shadow-md">
          {avatar}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold">{name}</h2>
          <p className="truncate text-xs text-muted">Your AI assistant · private to you</p>
        </div>
        <IconButton icon={Settings2} label="Customize assistant" size="sm" onClick={() => setShowSettings(true)} />
        <Menu
          trigger={(props) => <IconButton icon={MoreVertical} label="More actions" size="sm" {...props} />}
          items={[
            { label: "Export conversation (.md)", icon: Download, onSelect: exportChat },
            { label: "Clear conversation", icon: Trash2, danger: true, onSelect: () => setConfirmClear(true) },
          ]}
        />
        {onClose && <IconButton icon={X} label="Close assistant" size="sm" onClick={onClose} />}
      </header>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-thin" role="log" aria-label="Assistant conversation">
        {chatHistory.length === 0 && !isLoading ? (
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
            <span className="mb-3 text-5xl" aria-hidden="true">{avatar}</span>
            <h3 className="text-lg font-bold">Hi, I&apos;m {name}!</h3>
            <p className="mt-1 text-sm text-muted">
              Ask me anything — I can draft messages, summarize your chats and look people up.
            </p>
            <div className={cn("mt-5 grid w-full gap-2", !compact && "sm:grid-cols-2")}>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-left text-xs text-fg transition-colors hover:border-accent hover:bg-accent-soft"
                >
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
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-linear-to-br from-violet-600 to-purple-600 px-3.5 py-2 text-white shadow-sm">
                    <Markdown inverted>{m.content}</Markdown>
                  </div>
                </li>
              ) : (
                <li key={i} className="flex items-end gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base">
                    {avatar}
                  </span>
                  <div className="min-w-0 max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-surface-2 px-3.5 py-2">
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
        <p role="alert" className="shrink-0 border-t border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="shrink-0 border-t border-line p-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface-2 p-1.5 pl-3 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
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
            className="max-h-36 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm text-fg outline-none placeholder:text-subtle"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send to assistant"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-hover disabled:opacity-40"
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
              variant="danger"
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
