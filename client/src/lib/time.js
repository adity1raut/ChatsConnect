const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Compact relative time: "now", "5m", "3h", "Yesterday", "Mar 4"
export function timeAgo(date, now = Date.now()) {
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return "";
  const diff = now - t;
  if (diff < MINUTE) return "now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY && new Date(t).getDate() === new Date(now).getDate()) {
    return `${Math.floor(diff / HOUR)}h`;
  }
  if (diff < 2 * DAY && dayBucket(date, now) === "Yesterday") return "Yesterday";
  return new Date(t).toLocaleDateString([], { month: "short", day: "numeric" });
}

// Section heading for grouped lists
export function dayBucket(date, now = Date.now()) {
  const d = new Date(date);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const days = Math.round((today - start) / DAY);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This week";
  return "Earlier";
}
