import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";

// GET /api/messages/dm/:userId — fetch DM history with another user
export const getDMHistory = async (req, res) => {
  const myId = req.user._id;
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [myId, userId] },
    });

    if (!conversation) {
      return res.status(200).json({ messages: [], conversationId: null });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("senderId", "name username avatar")
      .lean();

    res.status(200).json({
      messages: messages.reverse(),
      conversationId: conversation._id,
    });
  } catch (err) {
    console.error("getDMHistory error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// GET /api/messages/group/:groupId — fetch group message history
export const getGroupHistory = async (req, res) => {
  const myId = req.user._id;
  const { groupId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    // Ensure user is a member
    const group = await Group.findOne({
      _id: groupId,
      "members.user": myId,
    });

    if (!group) {
      return res.status(403).json({ message: "Not a group member" });
    }

    const messages = await Message.find({ groupId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("senderId", "name username avatar")
      .lean();

    res.status(200).json({ messages: messages.reverse() });
  } catch (err) {
    console.error("getGroupHistory error:", err);
    res.status(500).json({ message: "Failed to fetch group messages" });
  }
};

// GET /api/messages/conversations — get all DM conversations for the user
export const getConversations = async (req, res) => {
  const myId = req.user._id;

  try {
    const conversations = await Conversation.find({
      participants: myId,
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name username avatar isOnline lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "name username" },
      })
      .lean();

    // Reshape: for each conversation, return the other participant as "contact"
    const result = conversations.map((conv) => {
      const other = conv.participants.find(
        (p) => p._id.toString() !== myId.toString()
      );
      return {
        conversationId: conv._id,
        contact: other,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
      };
    });

    res.status(200).json({ conversations: result });
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};
