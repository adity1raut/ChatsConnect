import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Badge, Button, Corners, Eyebrow, StatusDot } from "../../components/ui";
import SiteFooter from "../../components/layout/SiteFooter";
import SiteHeader from "../../components/layout/SiteHeader";
import { FEATURES } from "./features";

const HANDSHAKE = [
  ["handshake", "ECDH P-256", "OK"],
  ["cipher", "AES-256-GCM", "OK"],
  ["safety no.", "48213 90217", "VERIFIED"],
];

const PREVIEW = [
  { mine: false, text: "Are we still on for **Friday**?" },
  { mine: true, text: "Yes — I'll bring the slides." },
  { mine: false, text: "Perfect. See you then" },
];

const bold = (text) => text.split("**").map((part, i) => (i % 2 ? <strong key={i} className="text-foreground">{part}</strong> : part));

// Hero visual: a secure-channel console instead of the reference's 3D mascot
function ChannelConsole() {
  return (
    <div className="relative w-full max-w-md justify-self-center border border-border-strong bg-card/90 shadow-panel lg:justify-self-end" aria-hidden="true">
      <Corners />
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="eyebrow text-muted-foreground">
          Session <span className="text-faint">//</span> maya.chen
        </span>
        <span className="eyebrow flex items-center gap-2 text-primary">
          <StatusDot pulse /> Live
        </span>
      </div>

      <dl className="space-y-1.5 border-b border-dashed border-border px-4 py-3 text-[11px]">
        {HANDSHAKE.map(([step, value, result]) => (
          <div key={step} className="flex items-center gap-2">
            <dt className="text-faint">&gt; {step}</dt>
            <span className="min-w-0 flex-1 overflow-hidden text-faint/50 whitespace-nowrap">{".".repeat(40)}</span>
            <dd className="text-muted-foreground">{value}</dd>
            <dd className="w-16 text-right font-bold text-primary">[{result}]</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3 px-4 py-4">
        {PREVIEW.map((m, i) => (
          <div key={i} className={m.mine ? "flex justify-end" : "flex"}>
            <p
              className={
                m.mine
                  ? "max-w-[80%] border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-foreground"
                  : "max-w-[80%] border border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
              }
            >
              {bold(m.text)}
              {i === PREVIEW.length - 1 && <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-primary animate-blink" />}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-faint uppercase">
        <span className="flex items-center gap-1.5">
          <Lock className="size-3 text-primary" /> End-to-end encrypted
        </span>
        <span>Frame: ∞</span>
      </div>
    </div>
  );
}

function Hero({ signedIn }) {
  return (
    <section className="relative border-b border-border bg-grid">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] max-w-6xl grid-cols-1 items-center gap-14 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
        <div>
          <Eyebrow index="001" rule className="max-w-xl">
            Secure chat protocol
          </Eyebrow>

          <h1 className="mt-7 border-l border-dotted border-border-strong pl-4 text-[2rem] leading-[1.08] font-extrabold tracking-[0.08em] uppercase sm:pl-6 sm:text-5xl lg:text-[3.25rem]">
            <span className="block text-foreground">Messages for</span>
            <span className="block text-primary [text-shadow:0_0_28px_var(--glow)]">your people</span>
            <span className="mt-2 block text-muted-foreground">Not the server</span>
          </h1>

          <div aria-hidden="true" className="mt-7 w-72 max-w-full border-t-2 border-dotted border-border-strong" />

          <p className="mt-7 max-w-xl border-l border-border-strong pl-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
            Real-time chat, calls and an assistant you configure yourself — with direct messages encrypted on
            your device, so only you and your contacts can read them.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["E2EE", "WebRTC", "Markdown"].map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            <Badge>AI opt-in</Badge>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="glow">
              <Link to={signedIn ? "/dashboard" : "/registration"}>
                {signedIn ? "Open workspace" : "Start chatting"} <ArrowRight />
              </Link>
            </Button>
            {!signedIn && (
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>

          <div className="mt-12 flex max-w-xl items-center gap-3 text-[10px] tracking-[0.14em] text-faint uppercase">
            <span>∞</span>
            <span className="h-px flex-1 bg-border-strong" />
            <span>ChatsConnect sentinel</span>
          </div>
        </div>

        <ChannelConsole />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-border py-20 sm:py-24" aria-labelledby="features-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <h2 id="features-title" className="text-3xl leading-tight font-extrabold tracking-[0.02em] sm:text-4xl lg:text-5xl">
            Every conversation keeps its keys on your device.
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            One workspace for messages, calls, groups and your assistant — each doing one job, with privacy
            settings you can read in plain words.
          </p>
        </div>

        <ul className="mt-14 grid border-t border-l border-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, tag, desc }, i) => (
            <li key={title} className="group relative min-h-64 border-r border-b border-border bg-card/40 p-6 transition-colors hover:bg-card">
              <span aria-hidden="true" className="absolute top-5 right-5 size-8 border-t border-r border-border-strong transition-colors group-hover:border-primary/60" />
              <p className="text-[10px] text-faint tabular-nums">{String(i + 1).padStart(2, "0")}</p>
              <Icon className="mt-8 size-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-sm font-bold tracking-[0.14em] uppercase">{title}</h3>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">{desc}</p>
              <p className="eyebrow mt-5 text-faint">{tag}</p>
              <span aria-hidden="true" className="absolute right-5 bottom-5 size-1.5 rounded-full bg-primary/70 shadow-[0_0_8px_var(--glow)]" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const GUARANTEES = [
  { label: "Encrypted", tone: "text-info", text: "Direct messages are sealed with AES-256-GCM before they leave your browser." },
  { label: "Verified", tone: "text-primary", text: "Compare a safety number with your contact to rule out anyone in the middle." },
  { label: "Opt-in AI", tone: "text-warning", text: "The assistant only sees what you send it. Encrypted chats stay out of reach." },
  { label: "Device-bound", tone: "text-muted-foreground", text: "Your private key lives on this device, backed up only under your passphrase." },
];

function Security() {
  return (
    <section id="security" className="scroll-mt-20 border-b border-border bg-grid py-20 sm:py-24" aria-labelledby="security-title">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="eyebrow text-info">What the protocol protects</p>
          <h2 id="security-title" className="mt-4 text-3xl leading-tight font-extrabold sm:text-4xl lg:text-5xl">
            No server-side reading.
          </h2>
          <div aria-hidden="true" className="mt-6 h-px w-44 bg-linear-to-r from-primary to-transparent" />
          <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
            The server relays ciphertext it cannot open. Group chats and your assistant are clearly marked as
            not end-to-end encrypted, so you always know which is which.
          </p>
        </div>
        <ul className="grid border-t border-l border-border sm:grid-cols-2">
          {GUARANTEES.map(({ label, tone, text }) => (
            <li key={label} className="relative border-r border-b border-border bg-background/70 p-6">
              <span aria-hidden="true" className="absolute top-5 right-5 size-6 border-t border-r border-border-strong" />
              <p className={`eyebrow ${tone}`}>{label}</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const CONFIG = [
  ["name", '"Nova"'],
  ["avatar", '"🦊"'],
  ["tone", '"friendly"'],
  ["length", '"concise"'],
  ["language", '"auto"'],
  ["instructions", '"Keep replies short. I\'m a night owl."'],
];

function Assistant() {
  return (
    <section id="assistant" className="scroll-mt-20 border-b border-border py-20 sm:py-24" aria-labelledby="assistant-title">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <Eyebrow index="003">Personal assistant</Eyebrow>
          <h2 id="assistant-title" className="mt-5 text-3xl leading-tight font-extrabold sm:text-4xl">
            An assistant you configure — not one that configures you.
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">
            Name it, pick its tone and answer length, set the language and give it standing instructions. It
            drafts messages, summarizes chats and answers in Markdown, powered by Claude.
          </p>
        </div>
        <figure className="relative border border-border-strong bg-card">
          <Corners />
          <figcaption className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="eyebrow text-muted-foreground">assistant.config</span>
            <span className="eyebrow text-faint">JSON</span>
          </figcaption>
          <pre className="overflow-x-auto p-5 text-xs leading-7 scrollbar-thin">
            <span className="text-faint">{"{"}</span>
            {"\n"}
            {CONFIG.map(([key, value], i) => (
              <span key={key}>
                {"  "}
                <span className="text-info">{key}</span>
                <span className="text-faint">: </span>
                <span className="text-primary">{value}</span>
                <span className="text-faint">{i < CONFIG.length - 1 ? "," : ""}</span>
                {"\n"}
              </span>
            ))}
            <span className="text-faint">{"}"}</span>
          </pre>
        </figure>
      </div>
    </section>
  );
}

function CallToAction({ signedIn }) {
  return (
    <section className="bg-grid py-24" aria-labelledby="cta-title">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="eyebrow text-faint">004 / Get started</p>
        <h2 id="cta-title" className="mt-5 text-3xl font-extrabold tracking-[0.08em] uppercase sm:text-5xl">
          Open a <span className="text-primary">secure</span> channel.
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="glow">
            <Link to={signedIn ? "/dashboard" : "/registration"}>
              {signedIn ? "Open workspace" : "Create a free account"} <ArrowRight />
            </Link>
          </Button>
          {!signedIn && (
            <Button asChild size="lg" variant="outline">
              <Link to="/login">I have an account</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const signedIn = isAuthenticated();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero signedIn={signedIn} />
        <Features />
        <Security />
        <Assistant />
        <CallToAction signedIn={signedIn} />
      </main>
      <SiteFooter />
    </div>
  );
}
