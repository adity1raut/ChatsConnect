import Anthropic from "@anthropic-ai/sdk";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MAIN_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
export const FAST_MODEL =
  process.env.ANTHROPIC_FAST_MODEL || "claude-haiku-4-5-20251001";

export const CHATCONNECT_SYSTEM =
  "You are ChatBot, an intelligent assistant built into ChatConnect — a real-time messaging platform. " +
  "You help users draft messages, answer questions, summarise conversations, and more. " +
  "Be concise, friendly, and helpful. Never make up information.";

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

  const raw = response.content[0].text.trim();
  let replies;
  const match = raw.match(/\[[\s\S]*?\]/);
  if (match) {
    replies = JSON.parse(match[0]);
  } else {
    replies = raw
      .split("\n")
      .map((l) => l.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  replies = replies.filter(Boolean).slice(0, 3);
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
      const count = toolInput.text.trim().split(/\s+/).length;
      return `The text contains ${count} word(s).`;
    }

    if (toolName === "get_dm_history") {
      const { other_user_id, limit = 10 } = toolInput;
      const conv = await Conversation.findOne({
        participants: { $all: [requestingUserId, other_user_id] },
      });
      if (!conv) return "No conversation found between these users.";
      const msgs = await Message.find({ conversationId: conv._id })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 20))
        .populate("senderId", "name username")
        .lean();
      if (!msgs.length) return "No messages found.";
      return msgs
        .reverse()
        .map((m) => `${m.senderId?.name ?? "Unknown"}: ${m.content}`)
        .join("\n");
    }

    if (toolName === "get_group_history") {
      const { group_id, limit = 10 } = toolInput;
      const isMember = await Group.findOne({
        _id: group_id,
        "members.user": requestingUserId,
      });
      if (!isMember)
        return "Access denied: you are not a member of this group.";
      const msgs = await Message.find({ groupId: group_id })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 20))
        .populate("senderId", "name username")
        .lean();
      if (!msgs.length) return "No messages found.";
      return msgs
        .reverse()
        .map((m) => `${m.senderId?.name ?? "Unknown"}: ${m.content}`)
        .join("\n");
    }

    if (toolName === "get_user_profile") {
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
      const regex = new RegExp(toolInput.query, "i");
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
 * @returns {Promise<{reply: string, history: Array}>}
 */
export async function runAgentWithDBTools(
  userMessage,
  history = [],
  requestingUserId,
  systemPrompt = null,
) {
  const system = systemPrompt || CHATCONNECT_SYSTEM;
  const { toolDefs, executeTool } = buildDBTools(requestingUserId);

  const loopMessages = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  let reply = "";
  while (true) {
    const response = await client.messages.create({
      model: MAIN_MODEL,
      max_tokens: 1024,
      system,
      tools: toolDefs,
      messages: loopMessages,
    });

    if (response.stop_reason === "tool_use") {
      const toolUseBlock = response.content.find((b) => b.type === "tool_use");
      const toolResult = await executeTool(
        toolUseBlock.name,
        toolUseBlock.input,
      );
      loopMessages.push({ role: "assistant", content: response.content });
      loopMessages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUseBlock.id,
            content: String(toolResult),
          },
        ],
      });
    } else {
      const textBlock = response.content.find((b) => b.type === "text");
      reply = textBlock ? textBlock.text.trim() : "";
      break;
    }
  }

  return {
    reply,
    history: [
      ...history,
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
  return msgs.reverse().map((m) => ({
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
