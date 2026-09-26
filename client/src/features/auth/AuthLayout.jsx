import { Card, Corners, StatusDot } from "../../components/ui";
import SiteHeader from "../../components/layout/SiteHeader";

const COVERAGE = [
  { label: "Encrypted DMs", tone: "text-info", text: "Only you and the person you're talking to can read them." },
  { label: "Your assistant", tone: "text-primary", text: "Give it a name, a personality and your own instructions." },
  { label: "Voice + video", tone: "text-warning", text: "One-to-one or with your whole group, right from the chat." },
  { label: "Notifications", tone: "text-muted-foreground", text: "Across every device, with nothing lost on reload." },
];

// Shared frame for sign-in and sign-up: boxed site bar, workspace intro (wide screens), form panel
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background bg-grid text-foreground">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 pt-24 pb-12 sm:px-6">
        <div className="grid w-full max-w-6xl grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_28rem]">
          <section className="hidden lg:block" aria-label="Why ChatsConnect">
            <div className="border-l border-dashed border-border-strong pl-6">
              <p className="eyebrow text-faint">Secure workspace</p>
              <h2 className="mt-5 text-5xl leading-[1.1] font-extrabold tracking-[0.06em] uppercase">
                Start with
                <br />
                the <span className="text-primary">channel.</span>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
                Messages, calls and your own assistant in one place — with direct messages encrypted before they
                leave your device.
              </p>
            </div>

            <div className="mt-12 max-w-md border border-border bg-card/60 p-6">
              <p className="eyebrow text-faint">System coverage</p>
              <ul className="mt-2 divide-y divide-border">
                {COVERAGE.map(({ label, tone, text }) => (
                  <li key={label} className="py-4">
                    <p className={`text-xs font-bold uppercase ${tone}`}>{label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Card className="w-full bg-card/95 shadow-panel lg:mt-10">
            <Corners />
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <span className="eyebrow text-muted-foreground">Authentication</span>
              <span className="eyebrow flex items-center gap-2 text-primary">
                <StatusDot /> Secure
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <h1 className="text-xl font-extrabold tracking-[0.08em] uppercase">{title}</h1>
              {subtitle && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>}
              <div className="mt-7">{children}</div>
            </div>
            {footer && (
              <div className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">{footer}</div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
