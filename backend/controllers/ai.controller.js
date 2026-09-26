import Anthropic from "@anthropic-ai/sdk";
import User from "../models/user.model.js";
import AIConversation from "../models/aiConversation.model.js";
import logger from "../utils/logger.js";
import {
  buildSystemPrompt,
  maxTokensFor,
  withDefaults,
} from "../service/assistant.service.js";
import {
  MAIN_MODEL,
  FAST_MODEL,
  generateSmartReplies,
  runAgentWithDBTools,
  responseText,
} from "../service/aiService.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Persistent AI toggle ────────────────────────────────────────────────────

export const getAIStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("aiEnabled");
    res.json({ aiEnabled: user?.aiEnabled ?? false });
  } catch (err) {
    logger.error("AI getAIStatus failed", err);
    res.status(500).json({ message: "Something went wrong with the AI request. Please try again." });
  }
};

export const toggleAI = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.aiEnabled = !user.aiEnabled;
    await user.save();
    res.json({ aiEnabled: user.aiEnabled });
  } catch (err) {
    logger.error("AI toggleAI failed", err);
    res.status(500).json({ message: "Something went wrong with the AI request. Please try again." });
  }
};

// ── Smart Reply ─────────────────────────────────────────────────────────────

export const smartReply = async (req, res) => {
  try {
    const replies = await generateSmartReplies(req.body.messages || []);
    res.json({ replies });
  } catch (err) {
    logger.error("AI smartReply failed", err);
    res.status(500).json({ message: "Something went wrong with the AI request. Please try again." });
  }
};

// ── Summarize ───────────────────────────────────────────────────────────────

export const summarize = async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const conversation = messages
      .map(
        (m) =>
          `${m.role.charAt(0).toUpperCase() + m.role.slice(1)}: ${m.content}`,
      )
      .join("\n");

    const prompt =
      "Summarize the following conversation in 2–3 concise sentences. " +
      "Focus on the key topics and decisions made.\n\n" +
      `Conversation:\n${conversation}\n\nSummary:`;

    const response = await client.messages.create({
      model: MAIN_MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ summary: responseText(response) });
  } catch (err) {
    logger.error("AI summarize failed", err);
    res.status(500).json({ message: "Something went wrong with the AI request. Please try again." });
  }
};

// ── Translate ───────────────────────────────────────────────────────────────

export const translate = async (req, res) => {
  try {
    const { text, target_language, source_language = "auto" } = req.body;
    const detectNote =
      source_language === "auto"
        ? "Detect the source language and include it at the end on its own line as: DETECTED: <language>"
        : `Source language: ${source_language}`;

    const prompt =
      `Translate the following text to ${target_language}. ` +
      `${detectNote}\n` +
      "Return ONLY the translated text (and the DETECTED line if auto-detecting).\n\n" +
      `Text: ${text}`;

    const response = await client.messages.create({
      model: MAIN_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = responseText(response);
    let translated = raw;
    let detected = null;
    if (raw.includes("DETECTED:")) {
      const parts = raw.split("DETECTED:");
      translated = parts[0].trim();
      detected = parts[1].trim();
    }

    res.json({ translated_text: translated, detected_language: detected });
  } catch (err) {
    logger.error("AI translate failed", err);
    res.status(500).json({ message: "Something went wrong with the AI request. Please try again." });
  }
};

// ── Sentiment ───────────────────────────────────────────────────────────────

export const sentiment = async (req, res) => {
  try {
    const { text } = req.body;
    const prompt =
      "Analyse the sentiment of the following message. " +
      "Reply with ONLY a JSON object with fields: " +
      '"sentiment" (positive|negative|neutral), "score" (0.0-1.0), "emoji" (one emoji).\n\n' +
      `Message: "${text}"\n\nJSON:`;

    const response = await client.messages.create({
      model: FAST_MODEL,
      max_tokens: 128,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = responseText(response);
    const match = raw.match(/\{[\s\S]*?\}/);
    let data = { sentiment: "neutral", score: 0.5, emoji: "😐" };
    if (match) {
      try {
        data = { ...data, ...JSON.parse(match[0]) };
      } catch {
        // Malformed model output — keep the neutral default
      }
    }

    res.json({
      sentiment: data.sentiment,
      score: parseFloat(data.score),
      emoji: data.emoji,
    });
  } catch (err) {
    logger.error("AI sentiment failed", err);
    res.status(500).json({ message: "Something went wrong with the AI request. Please try again." });
  }
};

// ── AI Chat Agent (with DB tools) ───────────────────────────────────────────

const MAX_STORED_TURNS = 40;

// POST /api/ai/chat  { message } — talk to your own assistant
export const chat = async (req, res) => {
  const userId = req.user._id;
  try {
    const [user, conversation] = await Promise.all([
      User.findById(userId).select("name aiAssistant").lean(),
      AIConversation.findOne({ user: userId }).lean(),
    ]);
    const history = (conversation?.messages ?? []).map(({ role, content }) => ({ role, content }));

    const { reply } = await runAgentWithDBTools(
      req.body.message,
      history,
      userId.toString(),
      buildSystemPrompt(user?.aiAssistant, user?.name),
      { maxTokens: maxTokensFor(user?.aiAssistant) },
    );

    const now = new Date();
    const saved = await AIConversation.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: req.body.message, createdAt: now },
              { role: "assistant", content: reply, createdAt: new Date() },
            ],
            $slice: -MAX_STORED_TURNS,
          },
        },
      },
      { upsert: true, new: true },
    ).lean();

    res.json({
      reply,
      messages: saved.messages,
      // Clients from before server-side history read `history`; keep it until they're gone
      history: saved.messages.map(({ role, content }) => ({ role, content })),
    });
  } catch (err) {
    logger.error("AI chat failed", err);
    res.status(502).json({ message: "The assistant couldn't reply right now. Please try again." });
  }
};

// GET /api/ai/chat/history
export const getChatHistory = async (req, res) => {
  const conversation = await AIConversation.findOne({ user: req.user._id }).lean();
  res.json({ messages: conversation?.messages ?? [] });
};

// DELETE /api/ai/chat/history
export const clearChatHistory = async (req, res) => {
  await AIConversation.deleteOne({ user: req.user._id });
  res.json({ messages: [] });
};

// GET /api/ai/assistant
export const getAssistant = async (req, res) => {
  const user = await User.findById(req.user._id).select("aiAssistant").lean();
  res.json({ assistant: withDefaults(user?.aiAssistant) });
};

// PUT /api/ai/assistant  { name?, avatar?, tone?, length?, language?, instructions? }
export const updateAssistant = async (req, res) => {
  const $set = Object.fromEntries(
    Object.entries(req.body).map(([key, value]) => [`aiAssistant.${key}`, value]),
  );
  const user = await User.findByIdAndUpdate(req.user._id, { $set }, { new: true, runValidators: true })
    .select("aiAssistant")
    .lean();
  res.json({ assistant: withDefaults(user?.aiAssistant) });
};

// ── Health ──────────────────────────────────────────────────────────────────

export const healthCheck = async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res
      .status(503)
      .json({ status: "unavailable", message: "ANTHROPIC_API_KEY is not set" });
  }
  res.json({ status: "ok", service: "ChatConnect AI" });
};
