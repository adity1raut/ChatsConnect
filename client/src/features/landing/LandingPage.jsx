import { Link } from "react-router-dom";
import { ArrowRight, Lock, Moon, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Card, IconButton } from "../../components/ui";
import Brand from "../../components/layout/Brand";
import { FEATURES } from "./features";

function ChatPreview() {
  const bubbles = [
    { mine: false, text: "Are we still on for **Friday**? 🎉" },
    { mine: true, text: "Yes! I'll bring the slides." },
    { mine: false, text: "Perfect — see you then" },
  ];
  return (
    <Card className="p-5 relative mx-auto w-full max-w-sm space-y-3 p-5 shadow-2xl" aria-hidden="true">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">
          AP
        </span>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold">
            Alice Park <Lock className="size-3 text-emerald-500" />
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Online</p>
        </div>
      </div>
      {bubbles.map((b, i) => (
        <div key={i} className={b.mine ? "flex justify-end" : "flex"}>
          <span
            className={
              b.mine
                ? "rounded-2xl rounded-br-md bg-linear-to-br from-violet-600 to-purple-600 px-3.5 py-2 text-sm text-white"
                : "rounded-2xl rounded-bl-md border border-border bg-muted px-3.5 py-2 text-sm"
            }
          >
            {b.text.split("**").map((part, j) => (j % 2 ? <strong key={j}>{part}</strong> : part))}
          </span>
        </div>
      ))}
      <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-faint">
        <Lock className="size-3" /> End-to-end encrypted
      </p>
    </Card>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { isDark, setThemeMode } = useTheme();
  const signedIn = isAuthenticated();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Brand />
          <nav className="flex items-center gap-2">
            <IconButton
              icon={isDark ? Sun : Moon}
              label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
            />
            {!signedIn && (
              <Link to="/login" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground sm:inline-flex">
                Sign in
              </Link>
            )}
            <Link
              to={signedIn ? "/dashboard" : "/registration"}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
            >
              {signedIn ? "Open app" : "Get started"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary">
              <Lock className="size-3.5" aria-hidden="true" /> End-to-end encrypted direct messages
            </span>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
              Chat privately.{" "}
              <span className="bg-linear-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-400">
                With a little help from your own AI.
              </span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              ChatsConnect brings real-time messaging, voice and video calls, and a personal assistant
              you shape yourself — with direct messages only you and your contacts can read.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={signedIn ? "/dashboard" : "/registration"}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
              >
                {signedIn ? "Go to your dashboard" : "Create a free account"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              {!signedIn && (
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-6 text-sm font-semibold hover:bg-muted"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
          <ChatPreview />
        </section>

        <section className="border-t border-border bg-card/50 py-16 sm:py-20" aria-labelledby="features-title">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="features-title" className="text-center text-3xl font-extrabold tracking-tight">
              Everything you need to stay in touch
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <li key={title}>
                  <Card className="p-5 h-full space-y-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-faint">ChatsConnect · Mini Project</footer>
    </div>
  );
}
