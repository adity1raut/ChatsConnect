import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Check, Copy, Languages, MessageSquare } from "lucide-react";
import { Avatar, EmptyState, Markdown, Spinner } from "../../components/ui";
import { cn } from "../../lib/cn";
import { formatTime, groupByDay } from "./messages";

const NEAR_BOTTOM_PX = 120;

function MessageBubble({ message, showSender }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { mine, continued } = message;
  const text = showOriginal && message.originalText ? message.originalText : message.text;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <li className={cn("group flex gap-2", mine ? "justify-end" : "justify-start", continued ? "mt-0.5" : "mt-3")}>
      {!mine && (
        <span className="w-8 shrink-0 self-end">
          {!continued && <Avatar src={message.senderAvatar} name={message.senderName} size="sm" />}
        </span>
      )}
      <div className={cn("flex min-w-0 max-w-[85%] flex-col sm:max-w-[70%]", mine ? "items-end" : "items-start")}>
        {showSender && !mine && !continued && (
          <span className="mb-0.5 ml-1 text-[11px] font-semibold text-muted">{message.senderName}</span>
        )}
        <div className="flex max-w-full min-w-0 items-center gap-1">
          {mine && (
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? "Copied" : "Copy message"}
              className="flex size-7 items-center justify-center rounded-lg text-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-2 hover:text-fg focus-visible:opacity-100"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </button>
          )}
          <div
            className={cn(
              // min-w-0 lets wide content (code blocks, tables) scroll inside the bubble
              "min-w-0 rounded-2xl px-3.5 py-2 shadow-sm",
              mine
                ? "rounded-br-md bg-linear-to-br from-violet-600 to-purple-600 text-white"
                : "rounded-bl-md border border-line bg-surface text-fg",
            )}
          >
            <Markdown inverted={mine}>{text}</Markdown>
            <span
              className={cn(
                "mt-0.5 flex items-center justify-end gap-1.5 text-[10px]",
                mine ? "text-white/70" : "text-subtle",
              )}
            >
              {message.originalText && (
                <button
                  type="button"
                  onClick={() => setShowOriginal((v) => !v)}
                  className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                >
                  <Languages className="size-3" aria-hidden="true" />
                  {showOriginal ? "Show translation" : "Translated · show original"}
                </button>
              )}
              <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
            </span>
          </div>
          {!mine && (
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? "Copied" : "Copy message"}
              className="flex size-7 items-center justify-center rounded-lg text-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-2 hover:text-fg focus-visible:opacity-100"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function TypingBubble({ names }) {
  return (
    <li className="mt-3 flex items-end gap-2" aria-live="polite">
      <span className="w-8 shrink-0" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3">
        <span className="sr-only">{names.join(", ")} typing</span>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-subtle"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </li>
  );
}

export default function MessageList({ chatKey, messages, loading, isGroup, typingNames }) {
  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const sections = useMemo(() => groupByDay(messages), [messages]);
  const last = messages.at(-1);

  const scrollToBottom = (behavior = "smooth") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };

  // Opening a chat jumps straight to the newest message
  useLayoutEffect(() => {
    if (!loading) {
      scrollToBottom("instant");
      nearBottomRef.current = true;
    }
  }, [chatKey, loading]);

  // New message: follow it if you were at the bottom or sent it yourself
  useEffect(() => {
    if (!last) return;
    if (nearBottomRef.current || last.mine) scrollToBottom();
  }, [last]);

  useEffect(() => {
    if (typingNames.length && nearBottomRef.current) scrollToBottom();
  }, [typingNames.length]);

  const onScroll = () => {
    const el = scrollRef.current;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    nearBottomRef.current = near;
    setShowJump(!near);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto bg-bg px-3 py-4 scrollbar-thin sm:px-6"
        role="log"
        aria-label="Messages"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner label="Loading messages" className="size-7" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Say hello! Messages support **bold**, _italic_, `code`, lists and links."
            className="h-full"
          />
        ) : (
          sections.map((section) => (
            <section key={section.label} aria-label={section.label}>
              <div className="sticky top-0 z-10 my-3 flex justify-center">
                <span className="rounded-full border border-line bg-surface/90 px-3 py-0.5 text-[11px] font-semibold text-muted backdrop-blur">
                  {section.label}
                </span>
              </div>
              <ul>
                {section.items.map((m) => (
                  <MessageBubble key={m.id} message={m} showSender={isGroup} />
                ))}
              </ul>
            </section>
          ))
        )}
        {!loading && typingNames.length > 0 && (
          <ul>
            <TypingBubble names={typingNames} />
          </ul>
        )}
      </div>

      {showJump && (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          aria-label="Jump to latest messages"
          className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full border border-line bg-elevated text-fg shadow-lg hover:bg-surface-2"
        >
          <ArrowDown className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
