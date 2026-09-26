import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/utils";

// Plugins are module constants so ReactMarkdown doesn't re-create them per render
const REMARK_PLUGINS = [remarkGfm, remarkBreaks];
// No remote images: a markdown image would load from any server (tracking pixels)
const DISALLOWED = ["img"];

// Terminal-style code block: language tab + copy button above the code
function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const code = children?.props;
  const text = String(code?.children ?? "").replace(/\n$/, "");
  const language = /language-([\w-]+)/.exec(code?.className ?? "")?.[1] ?? "text";

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
    <div className="my-2 border border-border bg-background/70">
      <div className="flex items-center justify-between border-b border-border px-3 py-1">
        <span className="eyebrow text-faint">{language}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-primary"
        >
          {copied ? <Check className="size-3" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-foreground scrollbar-thin">{children}</pre>
    </div>
  );
}

// Element overrides; a module constant so React keeps component identity across renders
const COMPONENTS = {
  p: ({ children }) => <p className="my-1 first:mt-0 last:mb-0">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="font-medium wrap-break-word text-primary underline decoration-1 underline-offset-2"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-1 list-['▸_'] space-y-0.5 pl-4 marker:text-primary">{children}</ul>,
  ol: ({ children }) => <ol className="my-1 list-decimal space-y-0.5 pl-5 marker:text-faint">{children}</ol>,
  blockquote: ({ children }) => <blockquote className="my-1 border-l-2 border-primary/50 pl-3 opacity-90">{children}</blockquote>,
  h1: ({ children }) => <p className="my-1.5 font-bold tracking-[0.08em] uppercase">{children}</p>,
  h2: ({ children }) => <p className="my-1.5 font-bold tracking-[0.08em] uppercase">{children}</p>,
  h3: ({ children }) => <p className="my-1 font-bold">{children}</p>,
  h4: ({ children }) => <p className="my-1 font-semibold">{children}</p>,
  hr: () => <hr className="my-2 border-dashed border-border" />,
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="border border-border bg-muted px-1 py-px text-[0.85em] text-primary">{children}</code>
    ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto scrollbar-thin">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border px-2 py-1 text-left text-[10px] font-bold tracking-[0.12em] uppercase">{children}</th>
  ),
  td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
  input: ({ checked }) => (
    <input type="checkbox" checked={Boolean(checked)} readOnly className="mr-1.5 align-middle accent-primary" />
  ),
};

/**
 * Safe markdown for chat bubbles and AI replies: GFM (tables, task lists,
 * strikethrough), single newlines become line breaks, raw HTML is shown as text.
 */
export function Markdown({ children, className }) {
  return (
    <div className={cn("text-sm leading-relaxed wrap-break-word", className)}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        disallowedElements={DISALLOWED}
        unwrapDisallowed
        components={COMPONENTS}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
