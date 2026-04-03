import Anthropic from "@anthropic-ai/sdk";
import User from "../models/user.model.js";
import {
  MAIN_MODEL,
  FAST_MODEL,
  generateSmartReplies,
  runAgentWithDBTools,
} from "../service/aiService.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Persistent AI toggle ────────────────────────────────────────────────────

export const getAIStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("aiEnabled");
    res.json({ aiEnabled: user?.aiEnabled ?? false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleAI = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.aiEnabled = !user.aiEnabled;
    await user.save();
    res.json({ aiEnabled: user.aiEnabled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Smart Reply ─────────────────────────────────────────────────────────────

export const smartReply = async (req, res) => {
  try {
    const replies = await generateSmartReplies(req.body.messages || []);
    res.json({ replies });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    res.json({ summary: response.content[0].text.trim() });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    const raw = response.content[0].text.trim();
    let translated = raw;
    let detected = null;
    if (raw.includes("DETECTED:")) {
      const parts = raw.split("DETECTED:");
      translated = parts[0].trim();
      detected = parts[1].trim();
    }

    res.json({ translated_text: translated, detected_language: detected });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    const raw = response.content[0].text.trim();
    const match = raw.match(/\{[\s\S]*?\}/);
    let data = { sentiment: "neutral", score: 0.5, emoji: "😐" };
    if (match) {
      data = { ...data, ...JSON.parse(match[0]) };
    }

    res.json({
      sentiment: data.sentiment,
      score: parseFloat(data.score),
      emoji: data.emoji,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── AI Chat Agent (with DB tools) ───────────────────────────────────────────

export const chat = async (req, res) => {
  try {
    const { message, history = [], system_prompt } = req.body;
    const { reply, history: newHistory } = await runAgentWithDBTools(
      message,
      history,
      req.user._id.toString(),
      system_prompt,
    );
    res.json({ reply, history: newHistory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
