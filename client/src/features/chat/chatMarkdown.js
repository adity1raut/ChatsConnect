import { dayLabel, formatTime } from "./messages.js";

/** Markdown document for a chat export (messages are view messages, oldest first). */
export function buildChatMarkdown(chat, messages, exportedAt = new Date()) {
  const title = chat.type === "group" ? `Group chat: ${chat.name}` : `Chat with ${chat.name}`;
  const lines = [
    `# ${title}`,
    "",
    `_Exported from ChatsConnect on ${exportedAt.toLocaleString()} · ${messages.length} message${messages.length === 1 ? "" : "s"}_`,
    "",
  ];
  let day = null;
  for (const m of messages) {
    const label = dayLabel(m.createdAt, exportedAt);
    if (label !== day) {
      day = label;
      lines.push(`## ${label}`, "");
    }
    // Message text is already markdown — keep it as written
    lines.push(`**${m.senderName}** · ${formatTime(m.createdAt)}`, "", m.text || "_(empty)_", "");
  }
  return lines.join("\n");
}
