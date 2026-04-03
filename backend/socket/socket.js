import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import {
  generateSmartReplies,
  buildDMContext,
  buildGroupContext,
} from "../service/aiService.js";
import { bustMessageCache } from "../controllers/message.controller.js";
import { redisAddOnline, redisRemoveOnline } from "../cache/redis.js";

// In-process Map: userId -> socketId (fast O(1) lookups for targeting)
const onlineUsers = new Map();

let _io = null;
export const getIO = () => _io;

export function initSocket(httpServer) {
  const allowedOrigins = [
    "https://www.chatsconnect.tech",
    process.env.CLIENT_URL,
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173"] : []),
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    // Allow WebSocket only — removes HTTP polling overhead
    transports: ["websocket"],
    // Tune ping to detect dead connections quickly
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  _io = io;

  // ── JWT auth middleware ───────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    redisAddOnline(userId);

    socket.broadcast.emit("userOnline", { userId });
    socket.join(userId);

    // ── Direct Message ──────────────────────────────────────────────
    socket.on("sendMessage", async ({ receiverId, content }) => {
      if (!receiverId || !content?.trim()) return;

      try {
        let conversation = await Conversation.findOne({
          participants: { $all: [userId, receiverId] },
        });
        if (!conversation) {
          conversation = await Conversation.create({
            participants: [userId, receiverId],
          });
        }

        const message = await Message.create({
          senderId: userId,
          conversationId: conversation._id,
          content: content.trim(),
          messageType: "text",
          readBy: [userId],
        });

        conversation.lastMessage = message._id;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "name username avatar")
          .lean();

        // Bust cache so next REST fetch gets fresh data
        await bustMessageCache(conversation._id, null, [userId, receiverId]);

        io.to(receiverId).emit("newMessage", {
          message: populatedMessage,
          conversationId: conversation._id,
        });
        socket.emit("newMessage", {
          message: populatedMessage,
          conversationId: conversation._id,
        });

        // ── Real-time AI smart replies ────────────────────────────────
        const [receiverUser, senderUser] = await Promise.all([
          User.findById(receiverId).select("aiEnabled").lean(),
          User.findById(userId).select("aiEnabled").lean(),
        ]);

        if (receiverUser?.aiEnabled) {
          buildDMContext(conversation._id, receiverId, 8)
            .then((ctx) => generateSmartReplies(ctx))
            .then((replies) =>
              io.to(receiverId).emit("aiSmartReplies", {
                conversationId: conversation._id,
                replies,
              }),
            )
            .catch(() => {});
        }
        if (senderUser?.aiEnabled) {
          buildDMContext(conversation._id, userId, 8)
            .then((ctx) => generateSmartReplies(ctx))
            .then((replies) =>
              socket.emit("aiSmartReplies", {
                conversationId: conversation._id,
                replies,
              }),
            )
            .catch(() => {});
        }
      } catch (err) {
        console.error("sendMessage error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── Group Message ───────────────────────────────────────────────
    socket.on("sendGroupMessage", async ({ groupId, content }) => {
      if (!groupId || !content?.trim()) return;

      try {
        const group = await Group.findOne({
          _id: groupId,
          "members.user": userId,
        });
        if (!group)
          return socket.emit("error", { message: "Not a group member" });

        const message = await Message.create({
          senderId: userId,
          groupId,
          content: content.trim(),
          messageType: "text",
          readBy: [userId],
        });

        group.lastMessage = message._id;
        group.lastMessageAt = message.createdAt;
        await group.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "name username avatar")
          .lean();

        await bustMessageCache(null, groupId);

        io.to(`group:${groupId}`).emit("newGroupMessage", {
          message: populatedMessage,
          groupId,
        });

        // ── Real-time AI smart replies for group ──────────────────────
        const otherMemberIds = group.members
          .filter((m) => m.user.toString() !== userId)
          .map((m) => m.user.toString());

        if (otherMemberIds.length) {
          const aiUsers = await User.find({
            _id: { $in: otherMemberIds },
            aiEnabled: true,
          })
            .select("_id")
            .lean();

          if (aiUsers.length) {
            buildGroupContext(groupId, 8)
              .then((ctx) => generateSmartReplies(ctx))
              .then((replies) => {
                for (const u of aiUsers) {
                  io.to(u._id.toString()).emit("aiSmartReplies", {
                    groupId,
                    replies,
                  });
                }
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        console.error("sendGroupMessage error:", err);
        socket.emit("error", { message: "Failed to send group message" });
      }
    });

    // ── Join / Leave Group Room ───────────────────────────────────────
    socket.on("joinGroup", async ({ groupId }) => {
      if (!groupId) return;
      const isMember = await Group.findOne({
        _id: groupId,
        "members.user": userId,
      });
      if (isMember) socket.join(`group:${groupId}`);
    });

    socket.on("leaveGroup", ({ groupId }) => {
      if (groupId) socket.leave(`group:${groupId}`);
    });

    // ── WebRTC Signaling ─────────────────────────────────────────────
    socket.on(
      "callUser",
      ({ toUserId, callerName, callerAvatar, callType }) => {
        io.to(toUserId).emit("incomingCall", {
          callerId: userId,
          callerName,
          callerAvatar,
          callType,
        });
      },
    );
    socket.on("callAccepted", ({ toUserId }) => {
      io.to(toUserId).emit("callAccepted", { calleeId: userId });
    });
    socket.on("callRejected", ({ toUserId }) => {
      io.to(toUserId).emit("callRejected", { calleeId: userId });
    });
    socket.on("endCall", ({ toUserId }) => {
      io.to(toUserId).emit("callEnded", { byUserId: userId });
    });
    socket.on("webrtcOffer", ({ toUserId, offer }) => {
      io.to(toUserId).emit("webrtcOffer", { fromUserId: userId, offer });
    });
    socket.on("webrtcAnswer", ({ toUserId, answer }) => {
      io.to(toUserId).emit("webrtcAnswer", { fromUserId: userId, answer });
    });
    socket.on("iceCandidate", ({ toUserId, candidate }) => {
      io.to(toUserId).emit("iceCandidate", { fromUserId: userId, candidate });
    });

    // ── Typing indicators ────────────────────────────────────────────
    socket.on("typing", ({ receiverId, groupId }) => {
      if (receiverId) io.to(receiverId).emit("typing", { senderId: userId });
      else if (groupId)
        socket
          .to(`group:${groupId}`)
          .emit("typing", { senderId: userId, groupId });
    });
    socket.on("stopTyping", ({ receiverId, groupId }) => {
      if (receiverId)
        io.to(receiverId).emit("stopTyping", { senderId: userId });
      else if (groupId)
        socket
          .to(`group:${groupId}`)
          .emit("stopTyping", { senderId: userId, groupId });
    });

    // ── Disconnect ───────────────────────────────────────────────────
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      redisRemoveOnline(userId);
      socket.broadcast.emit("userOffline", { userId });
    });
  });

  return io;
}

export { onlineUsers };
