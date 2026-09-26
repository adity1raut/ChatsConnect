// The user's personal assistant: their settings become the system prompt,
// built here on the server (clients never send a system prompt).

export const TONES = {
  friendly: "Be warm, upbeat and encouraging.",
  professional: "Be clear, precise and professional.",
  casual: "Be relaxed and conversational, like texting a friend.",
  witty: "Be playful and witty with light humour, while staying genuinely helpful.",
  teacher: "Be patient: explain step by step and check understanding.",
};

export const LENGTHS = {
  short: { rule: "Keep replies brief: a sentence or two, or a few bullet points.", maxTokens: 800 },
  medium: { rule: "Aim for a focused answer of a paragraph or two.", maxTokens: 2000 },
  long: { rule: "Give thorough, detailed answers with examples where useful.", maxTokens: 4096 },
};

export const DEFAULT_ASSISTANT = {
  name: "ChatBot",
  avatar: "🤖",
  tone: "friendly",
  length: "medium",
  language: "auto",
  instructions: "",
};

export const withDefaults = (settings) => ({ ...DEFAULT_ASSISTANT, ...(settings ?? {}) });

export function buildSystemPrompt(settings, userName) {
  const s = withDefaults(settings);
  const lines = [
    `You are ${s.name}, the personal AI assistant of ${userName || "the user"} inside ChatsConnect, a real-time messaging app.`,
    "You help them draft messages, answer questions, summarise their conversations and more.",
    TONES[s.tone] ?? TONES.friendly,
    (LENGTHS[s.length] ?? LENGTHS.medium).rule,
    s.language === "auto"
      ? "Reply in the language the user writes in."
      : `Always reply in ${s.language}, whatever language the user writes in.`,
    "Format with Markdown when it helps (lists, **bold**, code blocks) — the app renders it.",
    "Never make up facts. When you need data from the app, use the tools. End-to-end encrypted messages are not visible to you; say so if asked about them.",
  ];
  if (s.instructions.trim()) {
    lines.push(
      "",
      "The user wrote these instructions for how you should behave. Follow them unless they conflict with honesty or safety:",
      "<user_instructions>",
      s.instructions.trim(),
      "</user_instructions>",
    );
  }
  return lines.join("\n");
}

export const maxTokensFor = (settings) =>
  (LENGTHS[withDefaults(settings).length] ?? LENGTHS.medium).maxTokens;
