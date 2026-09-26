import Anthropic from "@anthropic-ai/sdk";
import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MAIN_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
export const FAST_MODEL =
  process.env.ANTHROPIC_FAST_MODEL || "claude-haiku-4-5-20251001";

export const CHATCONNECT_SYSTEM =
  "You are ChatBot, an intelligent assistant built into ChatConnect — a real-time messaging platform. " +
  "You help users draft messages, answer questions, summarise conversations, and more. " +
  "Be concise, friendly, and helpful. Never make up information.";

// Agent loop limits
const MAX_AGENT_TURNS = 6; // model calls per chat request (tool round-trips + answer)
const MAX_REPLY_TOKENS = 4096; // per-reply cost cap for a public app
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_CHARS = 4000;
const MAX_TOOL_HISTORY = 20;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Model-supplied limits can be any type — clamp to 1..MAX_TOOL_HISTORY
const clampToolLimit = (limit) =>
  Math.min(MAX_TOOL_HISTORY, Math.max(1, parseInt(limit, 10) || 10));

// Join all text blocks of a response (content[0] is not guaranteed to be text)
export const responseText = (response) =>
  response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

/**
 * Client-supplied chat history is untrusted: keep only well-formed recent
 * turns, cap their size, and make sure the conversation starts with a user turn.
 */
function sanitizeHistory(history) {
  const cleaned = (Array.isArray(history) ? history : [])
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.slice(0, MAX_HISTORY_CHARS),
    }));
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  return cleaned;
}

/**
 * Generate 3 smart reply suggestions for a conversation context.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string[]>}
 */
export async function generateSmartReplies(messages) {
  const contextLines = messages
    .slice(-8)
    .map(
      (m) =>
        `${m.role.charAt(0).toUpperCase() + m.role.slice(1)}: ${m.content}`,
    )
    .join("\n");

  const prompt =
    "You are a messaging assistant. Based on the conversation below, " +
    "generate exactly 3 short, natural reply suggestions (max 12 words each). " +
    "Return ONLY a JSON array of 3 strings, nothing else.\n\n" +
    `Conversation:\n${contextLines}\n\nSuggestions (JSON array):`;

  const response = await client.messages.create({
    model: FAST_MODEL,
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = responseText(response);
  let replies = null;
  const match = raw.match(/\[[\s\S]*?\]/);
  if (match) {
    try {
      replies = JSON.parse(match[0]);
    } catch {
      replies = null; // fall through to line splitting
    }
  }
  if (!Array.isArray(replies)) {
    replies = raw
      .split("\n")
      .map((l) => l.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  replies = replies
    .filter((r) => typeof r === "string" && r.trim())
    .map((r) => r.trim().slice(0, 120))
    .slice(0, 3);
  while (replies.length < 3) replies.push("Sounds good!");
  return replies;
}

/**
 * Build the DB-powered tool definitions and executor for the chat agent.
 * The agent can read real conversations, groups, and user profiles from the DB.
 * Access is scoped to data the requesting user is allowed to see.
 *
 * @param {string} requestingUserId - MongoDB user ID of the caller
 */
function buildDBTools(requestingUserId) {
  const toolDefs = [
    {
      name: "get_current_time",
      description: "Return the current UTC date and time.",
      input_schema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "word_count",
      description: "Count the number of words in the provided text.",
      input_schema: {
        type: "object",
        properties: { text: { type: "string", description: "Text to count" } },
        required: ["text"],
      },
    },
    {
      name: "get_dm_history",
      description:
        "Fetch recent direct messages between the current user and another user.",
      input_schema: {
        type: "object",
        properties: {
          other_user_id: {
            type: "string",
            description: "The other user's MongoDB ID",
          },
          limit: {
            type: "number",
            description: "Number of messages to fetch (max 20)",
          },
        },
        required: ["other_user_id"],
      },
    },
    {
      name: "get_group_history",
      description:
        "Fetch recent messages from a group chat the user belongs to.",
      input_schema: {
        type: "object",
        properties: {
          group_id: { type: "string", description: "The group's MongoDB ID" },
          limit: {
            type: "number",
            description: "Number of messages to fetch (max 20)",
          },
        },
        required: ["group_id"],
      },
    },
    {
      name: "get_user_profile",
      description:
        "Fetch a user's public profile (name, username, bio, online status).",
      input_schema: {
        type: "object",
        properties: {
          user_id: { type: "string", description: "The user's MongoDB ID" },
        },
        required: ["user_id"],
      },
    },
    {
      name: "search_users",
      description: "Search for users by name or username.",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Name or username fragment to search",
          },
        },
        required: ["query"],
      },
    },
  ];

  async function executeTool(toolName, toolInput) {
    if (toolName === "get_current_time") {
      return new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    }

    if (toolName === "word_count") {
      const text = String(toolInput.text ?? "").trim();
      const count = text ? text.split(/\s+/).length : 0;
      return `The text contains ${count} word(s).`;
    }

    if (toolName === "get_dm_history") {
      const { other_user_id, limit } = toolInput;
      if (!mongoose.isValidObjectId(other_user_id)) return "Invalid user id.";
      const conv = await Conversation.findOne({
        participants: { $all: [requestingUserId, other_user_id] },
      });
      if (!conv) return "No conversation found between these users.";
      const msgs = await Message.find({ conversationId: conv._id })
        .sort({ createdAt: -1 })
        .limit(clampToolLimit(limit))
        .populate("senderId", "name username")
        .lean();
      if (!msgs.length) return "No messages found.";
      return msgs
        .reverse()
        .map((m) => `${m.senderId?.name ?? "Unknown"}: ${m.encrypted ? "[end-to-end encrypted message]" : m.content}`)
        .join("\n");
    }

    if (toolName === "get_group_history") {
      const { group_id, limit } = toolInput;
      if (!mongoose.isValidObjectId(group_id)) return "Invalid group id.";
      const isMember = await Group.exists({
        _id: group_id,
        "members.user": requestingUserId,
      });
      if (!isMember)
        return "Access denied: you are not a member of this group.";
      const msgs = await Message.find({ groupId: group_id })
        .sort({ createdAt: -1 })
        .limit(clampToolLimit(limit))
        .populate("senderId", "name username")
        .lean();
      if (!msgs.length) return "No messages found.";
      return msgs
        .reverse()
        .map((m) => `${m.senderId?.name ?? "Unknown"}: ${m.encrypted ? "[end-to-end encrypted message]" : m.content}`)
        .join("\n");
    }

    if (toolName === "get_user_profile") {
      if (!mongoose.isValidObjectId(toolInput.user_id)) return "Invalid user id.";
      const user = await User.findById(toolInput.user_id)
        .select("name username bio isOnline")
        .lean();
      if (!user) return "User not found.";
      return JSON.stringify({
        name: user.name,
        username: user.username,
        bio: user.bio ?? "",
        isOnline: user.isOnline,
      });
    }

    if (toolName === "search_users") {
      const query = String(toolInput.query ?? "").slice(0, 50);
      if (!query.trim()) return "No users found.";
      const regex = new RegExp(escapeRegex(query), "i");
      const users = await User.find({
        $or: [{ name: regex }, { username: regex }],
      })
        .select("name username bio")
        .limit(5)
        .lean();
      if (!users.length) return "No users found.";
      return users.map((u) => `${u.name} (@${u.username})`).join(", ");
    }

    return "Unknown tool";
  }

  return { toolDefs, executeTool };
}

/**
 * Run the AI chat agent with DB-powered tools.
 * Uses an agentic loop: if the model calls a tool, execute it and continue.
 *
 * @param {string} userMessage
 * @param {Array<{role:string,content:string}>} history
 * @param {string} requestingUserId - MongoDB user ID (scopes DB tool access)
 * @param {string|null} systemPrompt
 * @param {{maxTokens?: number}} [options]
 * @returns {Promise<{reply: string, history: Array}>}
 */
export async function runAgentWithDBTools(
  userMessage,
  history = [],
  requestingUserId,
  systemPrompt = null,
  { maxTokens = MAX_REPLY_TOKENS } = {},
) {
  const system = systemPrompt || CHATCONNECT_SYSTEM;
  const { toolDefs, executeTool } = buildDBTools(requestingUserId);

  const cleanHistory = sanitizeHistory(history);
  const loopMessages = [...cleanHistory, { role: "user", content: userMessage }];

  let reply = "";
  for (let turn = 0; turn < MAX_AGENT_TURNS; turn++) {
    const response = await client.messages.create({
      model: MAIN_MODEL,
      max_tokens: Math.min(maxTokens, MAX_REPLY_TOKENS),
      system,
      tools: toolDefs,
      messages: loopMessages,
    });

    if (response.stop_reason !== "tool_use") {
      reply = responseText(response);
      break;
    }

    // Claude may call several tools in one turn — every call needs a result,
    // and all results must go back together in a single user message.
    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    loopMessages.push({ role: "assistant", content: response.content });

    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        try {
          const result = await executeTool(block.name, block.input ?? {});
          return {
            type: "tool_result",
            tool_use_id: block.id,
            content: String(result),
          };
        } catch (err) {
          logger.error(`AI tool "${block.name}" failed:`, err);
          return {
            type: "tool_result",
            tool_use_id: block.id,
            content: "The tool failed to run.",
            is_error: true,
          };
        }
      }),
    );
    loopMessages.push({ role: "user", content: toolResults });
  }

  if (!reply) {
    reply =
      "Sorry, I couldn't complete that request. Please try rephrasing it.";
  }

  return {
    reply,
    history: [
      ...cleanHistory,
      { role: "user", content: userMessage },
      { role: "assistant", content: reply },
    ],
  };
}

/**
 * Fetch the last N messages from a DM conversation and format as role/content pairs.
 * Used by socket.js to build context for real-time smart replies.
 *
 * @param {string} conversationId
 * @param {string} receiverId - perspective: receiver is "user", sender is "assistant"
 * @param {number} limit
 * @returns {Promise<Array<{role:string,content:string}>>}
 */
export async function buildDMContext(conversationId, receiverId, limit = 8) {
  const msgs = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return msgs
    .reverse()
    .filter((m) => !m.encrypted)
    .map((m) => ({
      role: m.senderId.toString() === receiverId ? "user" : "assistant",
      content: m.content,
    }));
}

/**
 * Fetch the last N messages from a group and format as "Name: content" user messages.
 * Used by socket.js for group smart replies.
 *
 * @param {string} groupId
 * @param {number} limit
 * @returns {Promise<Array<{role:string,content:string}>>}
 */
export async function buildGroupContext(groupId, limit = 8) {
  const msgs = await Message.find({ groupId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("senderId", "name")
    .lean();
  return msgs.reverse().map((m) => ({
    role: "user",
    content: `${m.senderId?.name ?? "Unknown"}: ${m.content}`,
  }));
}
