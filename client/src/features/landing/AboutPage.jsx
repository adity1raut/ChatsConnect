import { Badge, Card, CardHeader, CardTitle, Corners, PageHeader } from "../../components/ui";
import { FEATURES } from "./features";

const STACK = [
  { layer: "Frontend", items: ["React 19", "Vite 7", "Tailwind CSS 4", "shadcn/ui + Radix", "React Router 7", "Socket.io client"] },
  { layer: "Backend", items: ["Node.js + Express 5", "Socket.io", "Passport (GitHub OAuth)", "zod validation", "helmet + rate limiting"] },
  { layer: "Data", items: ["MongoDB + Mongoose", "Redis (cache, OTPs)", "Cloudinary (avatars)"] },
  { layer: "Security & AI", items: ["Web Crypto (E2EE)", "JWT + hashed refresh tokens", "Anthropic Claude (assistant, smart replies)"] },
];

const SECURITY = [
  "Each account has an ECDH P-256 key pair created in your browser.",
  "Two people derive a shared AES-256-GCM key; every message gets a fresh IV and is bound to its sender and recipient.",
  "Your private key is backed up encrypted with your passphrase (PBKDF2, 600k iterations) — the server can't read it.",
  "Compare security codes with a contact to confirm nobody is in the middle.",
  "Group chats are not end-to-end encrypted.",
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="About / ChatsConnect"
        title="About the platform"
        description="A full-stack real-time chat platform with end-to-end encrypted direct messages, voice and video calls, and a personal AI assistant — built as a mini project."
      />

      <section aria-labelledby="about-features">
        <h2 id="about-features" className="eyebrow mb-4 text-primary">
          Features
        </h2>
        <ul className="grid grid-cols-1 border-t border-l border-border sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, tag, desc }, i) => (
            <li key={title} className="relative flex gap-4 border-r border-b border-border bg-card/60 p-5">
              <span className="text-[10px] text-faint tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-xs font-bold tracking-[0.12em] uppercase">{title}</span>
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{desc}</span>
              </span>
              <Badge variant="secondary" className="self-start">
                {tag}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-security">
        <Card>
          <Corners />
          <CardHeader className="border-b border-border pb-4">
            <CardTitle id="about-security" className="text-info">
              How encryption works
            </CardTitle>
          </CardHeader>
          <ol className="space-y-3 p-5">
            {SECURITY.map((line, i) => (
              <li key={line} className="flex gap-3 text-xs leading-relaxed">
                <span className="font-bold text-primary tabular-nums">&gt; {String(i + 1).padStart(2, "0")}</span>
                <span className="text-muted-foreground">{line}</span>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section aria-labelledby="about-stack">
        <h2 id="about-stack" className="eyebrow mb-4 text-primary">
          Built with
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STACK.map(({ layer, items }) => (
            <Card key={layer} className="p-5">
              <h3 className="eyebrow mb-3 text-muted-foreground">{layer}</h3>
              <ul className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <li key={item} className="border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
