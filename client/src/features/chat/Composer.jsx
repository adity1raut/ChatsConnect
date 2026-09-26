import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";
import { MAX_MESSAGE_LENGTH } from "./messages";

const MAX_HEIGHT_PX = 160;
const COUNTER_FROM = MAX_MESSAGE_LENGTH - 500;

// Phones insert a newline on Enter (the on-screen keyboard has a send button here)
const prefersEnterToSend = () =>
  typeof window !== "undefined" && !window.matchMedia?.("(pointer: coarse)").matches;

export default function Composer({ value, onChange, onSend, onTyping, placeholder, chatKey }) {
  const ref = useRef(null);

  // Grow with the text up to a limit, then scroll
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  // Focus the box when a chat opens (not on phones — it would pop the keyboard)
  useEffect(() => {
    if (prefersEnterToSend()) ref.current?.focus();
  }, [chatKey]);

  const [sending, setSending] = useState(false);
  const send = async () => {
    if (!value.trim() || sending) return;
    setSending(true);
    try {
      if (await onSend(value)) onChange("");
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    if (!prefersEnterToSend()) return;
    e.preventDefault();
    send();
  };

  const tooLong = value.length > MAX_MESSAGE_LENGTH;

  return (
    <div className="shrink-0 border-t border-border bg-card/80 px-3 pt-2.5 pb-3 sm:px-4">
      <div
        className={cn(
          "flex items-end gap-2 border bg-background p-1.5 pl-3 transition-[border-color,box-shadow]",
          "focus-within:border-primary focus-within:shadow-[0_0_0_1px_var(--primary),0_0_24px_var(--glow)]",
          tooLong ? "border-destructive" : "border-border-strong",
        )}
      >
        <span aria-hidden="true" className="self-center pb-px text-sm font-bold text-primary">
          &gt;
        </span>
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onTyping();
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Message"
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm text-foreground caret-primary outline-none placeholder:text-faint"
        />
        <button
          type="button"
          onClick={send}
          disabled={!value.trim() || tooLong || sending}
          aria-label="Send message"
          className="flex h-9 shrink-0 items-center justify-center gap-2 border border-primary bg-primary px-3 text-[10px] font-bold tracking-[0.12em] text-primary-foreground uppercase transition-[background-color,box-shadow] hover:bg-primary/90 hover:glow disabled:border-border-strong disabled:bg-transparent disabled:text-faint"
        >
          <span className="hidden sm:inline">Send</span>
          <SendHorizontal className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-1.5 hidden justify-between px-1 text-[10px] tracking-[0.04em] text-faint sm:flex">
        <span>
          <kbd className="border border-border px-1 font-bold text-muted-foreground">Enter</kbd> send ·{" "}
          <kbd className="border border-border px-1 font-bold text-muted-foreground">Shift+Enter</kbd> new line ·
          **bold** _italic_ `code` lists links
        </span>
        {value.length >= COUNTER_FROM && (
          <span className={tooLong ? "font-bold text-destructive" : ""}>
            {value.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
