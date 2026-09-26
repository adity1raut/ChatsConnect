// Pure helpers for chat messages — no React, easy to test and reuse

export const MAX_MESSAGE_LENGTH = 5000;
const GROUP_WINDOW_MS = 5 * 60 * 1000;

/** Server message → what the UI renders. Deleted accounts have no sender. */
export function toViewMessage(raw, myId) {
  const sender = raw.senderId || null;
  return {
    id: raw._id,
    senderId: sender?._id ?? null,
    mine: Boolean(sender && sender._id === myId),
    senderName: sender?.name ?? "Deleted account",
    senderUsername: sender?.username,
    senderAvatar: sender?.avatar,
    text: raw.content ?? "",
    createdAt: raw.createdAt,
  };
}

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function dayLabel(date, now = new Date()) {
  const d = new Date(date);
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((start(now) - start(d)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

/**
 * Split messages into day sections and mark "continued" bubbles — same
 * sender within 5 minutes — so avatars and names aren't repeated.
 */
export function groupByDay(messages) {
  const sections = [];
  let current = null;
  let prev = null;
  for (const m of messages) {
    const label = dayLabel(m.createdAt);
    if (!current || current.label !== label) {
      current = { label, items: [] };
      sections.push(current);
      prev = null;
    }
    const continued =
      prev &&
      prev.senderId === m.senderId &&
      new Date(m.createdAt) - new Date(prev.createdAt) < GROUP_WINDOW_MS;
    current.items.push({ ...m, continued: Boolean(continued) });
    prev = m;
  }
  return sections;
}

/** One line for the conversation list */
export const previewText = (text) =>
  String(text ?? "")
    .replace(/```[\s\S]*?```/g, "[code]")
    .replace(/[*_~`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
