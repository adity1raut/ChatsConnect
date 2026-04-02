import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";
import { onlineUsers } from "../socket/socket.js";

// GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  const userId = req.user._id;

  try {
    // Find all conversations this user is part of
    const conversations = await Conversation.find({
      participants: userId,
    }).lean();
    const conversationIds = conversations.map((c) => c._id);

    // Find all groups this user is part of
    const groups = await Group.find({ "members.user": userId }).lean();
    const groupIds = groups.map((g) => g._id);

    // Total messages across all DMs + groups involving this user
    const totalMessages = await Message.countDocuments({
      $or: [
        { conversationId: { $in: conversationIds } },
        { groupId: { $in: groupIds } },
      ],
    });

    // Recent activity: last 5 messages NOT sent by this user, across all conversations/groups
    const recentMessages = await Message.find({
      senderId: { $ne: userId },
      $or: [
        { conversationId: { $in: conversationIds } },
        { groupId: { $in: groupIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("senderId", "name avatar")
      .populate("groupId", "name")
      .lean();

    const recentActivity = recentMessages.map((msg) => ({
      user: msg.senderId?.name || "Unknown",
      avatar: msg.senderId?.avatar || null,
      action: msg.groupId
        ? `sent a message in ${msg.groupId.name}`
        : "sent you a message",
      time: msg.createdAt,
      type: msg.groupId ? "group" : "dm",
    }));

    res.status(200).json({
      stats: {
        totalMessages,
        activeUsers: onlineUsers.size,
        conversations: conversations.length,
        groups: groups.length,
      },
      recentActivity,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
