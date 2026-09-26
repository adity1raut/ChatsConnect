import { Link } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from "../ui";
import LogoMark from "./LogoMark";

const SITE_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/#security" },
  { label: "Assistant", href: "/#assistant" },
];

// Floating boxed top bar for the public pages (landing, sign in, sign up)
export default function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const { isDark, setThemeMode } = useTheme();
  const signedIn = isAuthenticated();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-4">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 border border-primary/25 bg-background/90 pr-2 pl-4 shadow-float backdrop-blur-sm sm:pl-7">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark className="size-6 shrink-0 text-primary" />
          <span className="-skew-x-12 text-[13px] font-extrabold tracking-[0.2em] text-foreground uppercase italic sm:text-sm">
            ChatsConnect
          </span>
        </Link>

        <nav aria-label="Site" className="hidden items-center gap-1 lg:flex">
          {SITE_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="border border-transparent px-2.5 py-1.5 text-[10px] font-bold tracking-[0.13em] text-muted-foreground uppercase transition-colors hover:border-primary/35 hover:bg-primary/[0.055] hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <IconButton
            size="sm"
            icon={isDark ? Sun : Moon}
            label={isDark ? "Light theme" : "Dark theme"}
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
          />
          {!signedIn && (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link to={signedIn ? "/dashboard" : "/registration"}>{signedIn ? "Open workspace" : "Get started"}</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton size="sm" icon={Menu} label="Menu" className="lg:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SITE_LINKS.map(({ label, href }) => (
                <DropdownMenuItem key={href} asChild>
                  <a href={href}>{label}</a>
                </DropdownMenuItem>
              ))}
              {!signedIn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/login">Sign in</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
