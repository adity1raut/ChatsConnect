import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/cn";

// Plugins are module constants so ReactMarkdown doesn't re-create them per render
const REMARK_PLUGINS = [remarkGfm, remarkBreaks];
// No remote images: a markdown image would load from any server (tracking pixels)
const DISALLOWED = ["img"];

function CodeBlock({ children, inverted }) {
  const [copied, setCopied] = useState(false);
  const text = String(children?.props?.children ?? "").replace(/\n$/, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — nothing to do
    }
  };

  return (
    <div className="group/code relative my-2">
      <pre
        className={cn(
          "overflow-x-auto rounded-lg p-3 pr-10 font-mono text-xs leading-relaxed scrollbar-thin",
          inverted ? "bg-black/25 text-white" : "bg-gray-900 text-gray-100 dark:bg-black/50",
        )}
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-white/10 text-gray-200 opacity-0 transition-opacity hover:bg-white/20 group-hover/code:opacity-100 focus-visible:opacity-100"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}

/**
 * Safe markdown for chat bubbles and AI replies: GFM (tables, task lists,
 * strikethrough), single newlines become line breaks, raw HTML is shown as
 * text, and `inverted` adapts colors for text on the accent background.
 */
export default function Markdown({ children, inverted = false, className }) {
  const components = {
    p: ({ children: c }) => <p className="my-1 first:mt-0 last:mb-0">{c}</p>,
    a: ({ href, children: c }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={cn(
          "font-medium underline underline-offset-2 break-words",
          inverted ? "text-white" : "text-accent-fg",
        )}
      >
        {c}
      </a>
    ),
    ul: ({ children: c }) => <ul className="my-1 list-disc space-y-0.5 pl-5">{c}</ul>,
    ol: ({ children: c }) => <ol className="my-1 list-decimal space-y-0.5 pl-5">{c}</ol>,
    blockquote: ({ children: c }) => (
      <blockquote
        className={cn(
          "my-1 border-l-2 pl-3 opacity-90",
          inverted ? "border-white/50" : "border-line-strong",
        )}
      >
        {c}
      </blockquote>
    ),
    h1: ({ children: c }) => <p className="my-1 text-base font-bold">{c}</p>,
    h2: ({ children: c }) => <p className="my-1 text-base font-bold">{c}</p>,
    h3: ({ children: c }) => <p className="my-1 font-bold">{c}</p>,
    h4: ({ children: c }) => <p className="my-1 font-semibold">{c}</p>,
    hr: () => <hr className={cn("my-2", inverted ? "border-white/30" : "border-line")} />,
    pre: ({ children: c }) => <CodeBlock inverted={inverted}>{c}</CodeBlock>,
    code: ({ className: cls, children: c }) =>
      cls ? (
        <code className={cls}>{c}</code>
      ) : (
        <code
          className={cn(
            "rounded px-1 py-0.5 font-mono text-[0.85em]",
            inverted ? "bg-white/20" : "bg-surface-2 text-fg",
          )}
        >
          {c}
        </code>
      ),
    table: ({ children: c }) => (
      <div className="my-2 overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse text-xs">{c}</table>
      </div>
    ),
    th: ({ children: c }) => (
      <th className={cn("border px-2 py-1 text-left font-semibold", inverted ? "border-white/30" : "border-line")}>
        {c}
      </th>
    ),
    td: ({ children: c }) => (
      <td className={cn("border px-2 py-1", inverted ? "border-white/30" : "border-line")}>{c}</td>
    ),
    input: ({ checked }) => (
      <input type="checkbox" checked={Boolean(checked)} readOnly className="mr-1 align-middle" />
    ),
  };

  return (
    <div className={cn("text-sm leading-relaxed break-words", className)}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        disallowedElements={DISALLOWED}
        unwrapDisallowed
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
