import { Calendar, Camera, Link2, MapPin } from "lucide-react";
import { Card, Corners, StatusDot, UserAvatar } from "../../components/ui";
import { cn } from "../../lib/utils";
import { timeAgo } from "../../lib/time";

const joinedLabel = (date) =>
  date
    ? `Joined ${new Date(date).toLocaleDateString([], { month: "long", year: "numeric" })}`
    : null;

const websiteLabel = (url) => {
  try {
    const { hostname, pathname } = new URL(url);
    return `${hostname.replace(/^www\./, "")}${pathname === "/" ? "" : pathname}`;
  } catch {
    return url;
  }
};

// Online / last seen, or nothing when the person hides their activity
function presenceText(online, lastSeen) {
  if (online) return "Online";
  if (lastSeen) return `Last seen ${timeAgo(lastSeen)}`;
  return null;
}

/**
 * Cover + avatar + identity + meta. `onAvatarChange` makes the avatar
 * editable (own profile); `stats` and `actions` fill the right-hand side.
 */
export default function ProfileHeader({
  user,
  avatarSrc,
  online,
  onAvatarChange,
  avatarBusy,
  stats,
  actions,
}) {
  const presence = presenceText(online, user.lastSeen);
  const meta = [
    user.location && { icon: MapPin, text: user.location },
    user.website && { icon: Link2, text: websiteLabel(user.website), href: user.website },
    user.createdAt && { icon: Calendar, text: joinedLabel(user.createdAt) },
  ].filter(Boolean);

  return (
    <Card className="overflow-hidden">
      <Corners />
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5 sm:px-6">
        <span className="eyebrow text-muted-foreground">
          Profile <span className="text-faint">//</span> @{user.username}
        </span>
        {presence && (
          <span className={cn("eyebrow flex items-center gap-2", online ? "text-success" : "text-faint")}>
            <StatusDot tone={online ? "success" : "idle"} />
            {presence}
          </span>
        )}
      </div>
      <div
        aria-hidden="true"
        className="h-24 border-b border-border bg-grid bg-[radial-gradient(ellipse_at_top_left,var(--glow),transparent_65%)] sm:h-28"
      />
      <div className="px-5 pb-6 sm:px-6">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-3">
          <div className="relative">
            <UserAvatar
              src={avatarSrc ?? user.avatar}
              name={user.name}
              size="2xl"
              className="bg-card p-1 ring-1 ring-border-strong"
            />
            {onAvatarChange && (
              <label
                className="absolute -right-2 -bottom-2 flex size-9 cursor-pointer items-center justify-center border border-primary/60 bg-popover text-primary transition-colors hover:bg-primary/15 focus-within:outline-1 focus-within:outline-ring"
                title="Change photo"
              >
                <Camera className="size-4" aria-hidden="true" />
                <span className="sr-only">Change photo</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  disabled={avatarBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) onAvatarChange(file);
                  }}
                />
              </label>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2 pb-1">{actions}</div>}
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-[0.08em] uppercase sm:text-2xl">{user.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">@{user.username}</p>
          </div>

          {user.statusMessage && (
            <p className="inline-flex max-w-full items-center gap-2 border border-primary/35 bg-primary/[0.07] px-2.5 py-1 text-xs text-primary">
              <span aria-hidden="true">&gt;</span>
              <span className="truncate">{user.statusMessage}</span>
            </p>
          )}
          {user.bio && (
            <p className="max-w-2xl border-l border-border-strong pl-3 text-xs leading-relaxed whitespace-pre-line text-foreground">
              {user.bio}
            </p>
          )}

          {meta.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
              {meta.map(({ icon: Icon, text, href }) => (
                <li key={text} className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5 text-faint" aria-hidden="true" />
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {text}
                    </a>
                  ) : (
                    text
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {stats?.length > 0 && (
        <dl className="grid border-t border-border" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
          {stats.map(({ label, value }) => (
            <div key={label} className="border-r border-border px-5 py-3.5 last:border-r-0 sm:px-6">
              <dd className="text-xl font-extrabold tabular-nums">{value}</dd>
              <dt className="eyebrow mt-1 text-faint">{label}</dt>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}
