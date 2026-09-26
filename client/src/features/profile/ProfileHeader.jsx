import { Calendar, Camera, Link2, MapPin } from "lucide-react";
import { Card, UserAvatar } from "../../components/ui";
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
      <div
        aria-hidden="true"
        className="h-28 bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 sm:h-36"
      />
      <div className="px-5 pb-5 sm:px-6">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-3">
          <div className="relative">
            <UserAvatar
              src={avatarSrc ?? user.avatar}
              name={user.name}
              size="2xl"
              online={online}
              className="rounded-full ring-4 ring-card"
            />
            {onAvatarChange && (
              <label
                className="absolute right-1 bottom-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg ring-2 ring-card transition-colors hover:bg-primary/90 focus-within:outline-2 focus-within:outline-primary"
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

        <div className="mt-3 space-y-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              @{user.username}
              {presence && (
                <>
                  <span className="mx-1.5 text-faint">·</span>
                  <span className={online ? "text-emerald-600 dark:text-emerald-400" : ""}>
                    {presence}
                  </span>
                </>
              )}
            </p>
          </div>

          {user.statusMessage && (
            <p className="inline-flex max-w-full rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="truncate">{user.statusMessage}</span>
            </p>
          )}
          {user.bio && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{user.bio}</p>
          )}

          {meta.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {meta.map(({ icon: Icon, text, href }) => (
                <li key={text} className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5" aria-hidden="true" />
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-medium text-primary hover:underline"
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

          {stats?.length > 0 && (
            <dl className="flex gap-6 pt-1">
              {stats.map(({ label, value }) => (
                <div key={label}>
                  <dd className="text-lg font-bold">{value}</dd>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </Card>
  );
}
