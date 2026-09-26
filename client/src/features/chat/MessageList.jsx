import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Check, Copy, Languages, Lock, MessageSquare } from "lucide-react";
import { EmptyState, Markdown, Spinner, UserAvatar } from "../../components/ui";
import { cn } from "../../lib/utils";
import { formatTime, groupByDay } from "./messages";

const NEAR_BOTTOM_PX = 120;

function MessageBubble({ message, showSender, onTranslate }) {
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
          {!continued && <UserAvatar src={message.senderAvatar} name={message.senderName} size="sm" />}
        </span>
      )}
      <div className={cn("flex min-w-0 max-w-[85%] flex-col sm:max-w-[70%]", mine ? "items-end" : "items-start")}>
        {showSender && !mine && !continued && (
          <span className="mb-1 text-[10px] font-bold tracking-[0.1em] text-info uppercase">{message.senderName}</span>
        )}
        <div className="flex max-w-full min-w-0 items-center gap-1">
          {mine && (
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? "Copied" : "Copy message"}
              className="flex size-7 items-center justify-center text-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </button>
          )}
          <div
            className={cn(
              // min-w-0 lets wide content (code blocks, tables) scroll inside the bubble
              "min-w-0 border px-3.5 py-2 text-foreground",
              mine
                ? "border-primary/35 border-r-2 border-r-primary bg-primary/[0.09]"
                : "border-border border-l-2 border-l-border-strong bg-card",
            )}
          >
            {message.undecryptable ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                {text}
              </p>
            ) : (
              <Markdown>{text}</Markdown>
            )}
            <span
              className={cn(
                "mt-1 flex items-center justify-end gap-1.5 text-[10px] tracking-[0.06em]",
                mine ? "text-primary/70" : "text-faint",
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
              {onTranslate && !mine && !message.originalText && !message.undecryptable && (
                <button
                  type="button"
                  onClick={() => onTranslate(message.id)}
                  title={message.encrypted ? "Sends this message to the AI to translate it" : undefined}
                  className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 hover:underline focus-visible:opacity-100"
                >
                  <Languages className="size-3" aria-hidden="true" />
                  Translate
                </button>
              )}
              {message.encrypted && !message.undecryptable && (
                <Lock className="size-2.5" aria-label="End-to-end encrypted" />
              )}
              <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
            </span>
          </div>
          {!mine && (
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? "Copied" : "Copy message"}
              className="flex size-7 items-center justify-center text-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100"
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
      <div className="flex items-center gap-1 border border-l-2 border-border border-l-border-strong bg-card px-4 py-3">
        <span className="sr-only">{names.join(", ")} typing</span>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-pulse bg-primary"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </li>
  );
}

export default function MessageList({ chatKey, messages, loading, isGroup, typingNames, onTranslate }) {
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
        className="h-full overflow-y-auto bg-background px-3 py-4 scrollbar-thin sm:px-6"
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
              {/* The label sticks while you scroll the day; the dashed rule stays put */}
              <div className="pointer-events-none sticky top-2 z-10 mt-4 -mb-10 flex h-6 items-center justify-center" aria-hidden="true">
                <span className="eyebrow border border-border bg-background px-2.5 py-1 text-faint">// {section.label}</span>
              </div>
              <div className="my-4 flex h-6 items-center" aria-hidden="true">
                <span className="h-px flex-1 border-t border-dashed border-border" />
              </div>
              <ul>
                {section.items.map((m) => (
                  <MessageBubble key={m.id} message={m} showSender={isGroup} onTranslate={onTranslate} />
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
          className="absolute right-4 bottom-4 flex size-10 items-center justify-center border border-primary/50 bg-popover text-primary shadow-float hover:bg-primary/15"
        >
          <ArrowDown className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
