import { KeyRound, Layers, ShieldCheck } from "lucide-react";
import { Card } from "../../components/ui";
import Brand from "../../components/layout/Brand";
import { FEATURES } from "./features";

const STACK = [
  { layer: "Frontend", items: ["React 19", "Vite 7", "Tailwind CSS 4", "React Router 7", "Socket.io client"] },
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
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <header className="space-y-3 text-center">
        <Brand className="justify-center" />
        <p className="mx-auto max-w-xl text-muted-foreground">
          A full-stack real-time chat platform with end-to-end encrypted direct messages, voice and
          video calls, and a personal AI assistant — built as a mini project.
        </p>
      </header>

      <section aria-labelledby="about-features">
        <h2 id="about-features" className="mb-4 text-xs font-semibold tracking-wider text-faint uppercase">
          Features
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <li key={title}>
              <Card className="p-5 flex h-full gap-3 p-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="block text-sm text-muted-foreground">{desc}</span>
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-security">
        <h2 id="about-security" className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider text-faint uppercase">
          <ShieldCheck className="size-4" aria-hidden="true" /> How encryption works
        </h2>
        <Card className="p-5">
          <ul className="space-y-2">
            {SECURITY.map((line) => (
              <li key={line} className="flex gap-2 text-sm">
                <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section aria-labelledby="about-stack">
        <h2 id="about-stack" className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider text-faint uppercase">
          <Layers className="size-4" aria-hidden="true" /> Built with
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {STACK.map(({ layer, items }) => (
            <Card key={layer} className="p-4">
              <h3 className="mb-2 text-sm font-bold">{layer}</h3>
              <ul className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <li key={item} className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
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
