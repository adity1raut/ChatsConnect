export const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "witty", label: "Witty" },
  { value: "teacher", label: "Teacher" },
];

export const LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Detailed" },
];

export const AVATAR_PRESETS = ["🤖", "✨", "🦉", "🐱", "🦊", "🧠", "🚀", "🌙", "🎧", "📚"];

export const INSTRUCTION_EXAMPLES = [
  "Explain things simply, like I'm new to the topic.",
  "Always answer with bullet points.",
  "You're an experienced JavaScript engineer — include code examples.",
  "Help me write polite, professional messages.",
];

export const STARTER_PROMPTS = [
  "Help me write a friendly message to reschedule a meeting",
  "Summarize my recent chats",
  "Explain end-to-end encryption in simple terms",
  "Find people named Alex",
];

/** Markdown export of an assistant conversation */
export function buildAssistantMarkdown(assistant, messages, exportedAt = new Date()) {
  const name = assistant?.name || "Assistant";
  const lines = [
    `# Conversation with ${name}`,
    "",
    `_Exported from ChatsConnect on ${exportedAt.toLocaleString()} · ${messages.length} messages_`,
    "",
  ];
  for (const m of messages) {
    const who = m.role === "user" ? "You" : `${assistant?.avatar ?? ""} ${name}`.trim();
    const when = m.createdAt ? ` · ${new Date(m.createdAt).toLocaleString()}` : "";
    lines.push(`### ${who}${when}`, "", m.content, "");
  }
  return lines.join("\n");
}
