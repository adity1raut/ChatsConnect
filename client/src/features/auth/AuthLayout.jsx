import { Link } from "react-router-dom";
import { Bell, Bot, Lock, Moon, Sun, Video } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Card, IconButton } from "../../components/ui";
import Brand from "../../components/layout/Brand";

const HIGHLIGHTS = [
  { icon: Lock, title: "End-to-end encrypted DMs", text: "Only you and the person you're talking to can read them." },
  { icon: Bot, title: "Your own AI assistant", text: "Give it a name, a personality and your own instructions." },
  { icon: Video, title: "Voice & video calls", text: "One-to-one or with your whole group." },
  { icon: Bell, title: "Notifications that keep up", text: "Across every device, with nothing lost on reload." },
];

// Shared frame for sign-in and sign-up: brand bar, highlights (wide screens), form card
export default function AuthLayout({ title, subtitle, children, footer }) {
  const { isDark, setThemeMode } = useTheme();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Link to="/" aria-label="ChatsConnect home">
          <Brand />
        </Link>
        <IconButton
          icon={isDark ? Sun : Moon}
          label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setThemeMode(isDark ? "light" : "dark")}
        />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-8">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
          <section className="hidden space-y-6 lg:block" aria-label="Why ChatsConnect">
            <h2 className="text-4xl leading-tight font-extrabold tracking-tight">
              Messaging that&apos;s{" "}
              <span className="bg-linear-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-400">
                private, smart and yours
              </span>
              .
            </h2>
            <ul className="space-y-4">
              {HIGHLIGHTS.map(({ icon: Icon, title: t, text }) => (
                <li key={t} className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="block text-sm text-muted-foreground">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <Card className="p-5 mx-auto w-full max-w-md p-6 shadow-xl sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
            {footer && <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">{footer}</div>}
          </Card>
        </div>
      </main>
    </div>
  );
}
