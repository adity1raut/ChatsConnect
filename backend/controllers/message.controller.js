import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
  TTL,
} from "../cache/redis.js";

// GET /api/messages/dm/:userId
export const getDMHistory = async (req, res) => {
  const myId = req.user._id.toString();
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const cacheKey = `dm:${[myId, userId].sort().join(":")}:p${page}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    const conversation = await Conversation.findOne({
      participants: { $all: [myId, userId] },
    });

    if (!conversation) {
      const empty = { messages: [], conversationId: null };
      return res.status(200).json(empty);
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("senderId", "name username avatar")
      .lean();

    const payload = {
      messages: messages.reverse(),
      conversationId: conversation._id,
    };

    await cacheSet(cacheKey, payload, TTL.DM_HISTORY);
    res.status(200).json(payload);
  } catch (err) {
    console.error("getDMHistory error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// GET /api/messages/group/:groupId
export const getGroupHistory = async (req, res) => {
  const myId = req.user._id.toString();
  const { groupId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const cacheKey = `group_msgs:${groupId}:p${page}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    const group = await Group.findOne({ _id: groupId, "members.user": myId });
    if (!group) return res.status(403).json({ message: "Not a group member" });

    const messages = await Message.find({ groupId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("senderId", "name username avatar")
      .lean();

    const payload = { messages: messages.reverse() };
    await cacheSet(cacheKey, payload, TTL.GROUP_HISTORY);
    res.status(200).json(payload);
  } catch (err) {
    console.error("getGroupHistory error:", err);
    res.status(500).json({ message: "Failed to fetch group messages" });
  }
};

// GET /api/messages/conversations
export const getConversations = async (req, res) => {
  const myId = req.user._id.toString();
  const cacheKey = `conversations:${myId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    const conversations = await Conversation.find({ participants: myId })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name username avatar isOnline lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "name username" },
      })
      .lean();

    const result = conversations.map((conv) => {
      const other = conv.participants.find((p) => p._id.toString() !== myId);
      return {
        conversationId: conv._id,
        contact: other,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
      };
    });

    const payload = { conversations: result };
    await cacheSet(cacheKey, payload, TTL.CONVERSATIONS);
    res.status(200).json(payload);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// Called by socket.js after a new message is saved — bust stale cache
export async function bustMessageCache(
  conversationId,
  groupId,
  participantIds = [],
) {
  if (conversationId) {
    await cacheDelPattern(`dm:*:p*`); // simple bust — keys include sorted IDs
    for (const uid of participantIds) {
      await cacheDel(`conversations:${uid}`);
    }
  }
  if (groupId) {
    await cacheDelPattern(`group_msgs:${groupId}:p*`);
  }
}
