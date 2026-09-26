import mongoose from "mongoose";
import { Server } from "socket.io";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import {
  generateSmartReplies,
  buildDMContext,
  buildGroupContext,
} from "../service/aiService.js";
import { notify } from "../service/notification.service.js";
import { bustMessageCache } from "../controllers/message.controller.js";
import { redisAddOnline, redisRemoveOnline } from "../cache/redis.js";
import {
  loadPresenceVisibility,
  markOffline,
  markOnline,
  visibleOnlineIds,
} from "../service/presence.service.js";
import { verifyAccessToken } from "../service/token.service.js";
import { getIO, isOnline, onlineUsers, setIO } from "./io.js";
import logger from "../utils/logger.js";

export { getIO, onlineUsers };

const MAX_MESSAGE_LENGTH = 5000;
const isId = (value) => mongoose.isValidObjectId(value);

// "callerId:calleeId" → ring that hasn't been answered yet (for missed calls)
const pendingCalls = new Map();
const callKey = (callerId, calleeId) => `${callerId}:${calleeId}`;

function recordMissedCall(callerId, calleeId) {
  const pending = pendingCalls.get(callKey(callerId, calleeId));
  if (!pending) return;
  pendingCalls.delete(callKey(callerId, calleeId));
  notify({
    recipient: calleeId,
    type: "missed_call",
    actor: callerId,
    meta: { callType: pending.callType },
  });
}

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

  setIO(io);

  // ── JWT auth middleware ───────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));
    try {
      socket.userId = String(verifyAccessToken(token).userId);
      next();
    } catch {
      // The client refreshes its access token when it sees this message
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    socket.join(userId);

    // ── Presence: online while any tab is connected ────────────────
    const sockets = onlineUsers.get(userId) ?? new Set();
    const firstTab = sockets.size === 0;
    sockets.add(socket.id);
    onlineUsers.set(userId, sockets);
    if (firstTab) {
      redisAddOnline(userId);
      // Non-blocking: listeners below must be registered before any await
      loadPresenceVisibility(userId)
        .catch(() => true)
        .then(() => markOnline(userId));
    }
    // Snapshot so this client knows who was already online (hidden users excluded)
    socket.emit("onlineUsers", {
      userIds: visibleOnlineIds([...onlineUsers.keys()]),
    });

    // Join every group room, so group messages and typing arrive on any page
    Group.find({ "members.user": userId })
      .select("_id")
      .lean()
      .then((groups) => groups.forEach((g) => socket.join(`group:${g._id}`)))
      .catch((err) => logger.warn(`Joining group rooms failed: ${err.message}`));

    // Which chat this tab is looking at (suppresses notifications for it)
    socket.on("activeChat", ({ conversationId, groupId, peerId } = {}) => {
      socket.data.activeChat = isId(conversationId)
        ? `dm:${conversationId}`
        : isId(groupId)
          ? `group:${groupId}`
          : isId(peerId)
            ? `peer:${peerId}`
            : null;
    });

    // ── Direct Message ──────────────────────────────────────────────
    socket.on("sendMessage", async ({ receiverId, content } = {}) => {
      const text = typeof content === "string" ? content.trim() : "";
      if (!isId(receiverId) || !text || receiverId === userId) return;
      if (text.length > MAX_MESSAGE_LENGTH) {
        return socket.emit("error", { message: "Message is too long" });
      }

      try {
        const receiver = await User.findById(receiverId)
          .select("name username avatar aiEnabled")
          .lean();
        if (!receiver) {
          return socket.emit("error", { message: "User not found" });
        }

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
          content: text,
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

        const payload = {
          message: populatedMessage,
          conversationId: conversation._id,
          // Lets the sender's tabs file a brand-new conversation under the right person
          receiver: {
            _id: receiver._id,
            name: receiver.name,
            username: receiver.username,
            avatar: receiver.avatar,
          },
        };
        // User rooms reach every open tab of both people
        io.to(receiverId).emit("newMessage", payload);
        io.to(userId).emit("newMessage", payload);

        notify({
          recipient: receiverId,
          type: "message",
          actor: userId,
          conversationId: conversation._id,
          body: text,
        });

        // ── Real-time AI smart replies for the receiver ──────────────
        if (receiver.aiEnabled) {
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
      } catch (err) {
        logger.error("sendMessage error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── Group Message ───────────────────────────────────────────────
    socket.on("sendGroupMessage", async ({ groupId, content } = {}) => {
      const text = typeof content === "string" ? content.trim() : "";
      if (!isId(groupId) || !text) return;
      if (text.length > MAX_MESSAGE_LENGTH) {
        return socket.emit("error", { message: "Message is too long" });
      }

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
          content: text,
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

        const otherMemberIds = group.members
          .map((m) => m.user.toString())
          .filter((id) => id !== userId);

        for (const memberId of otherMemberIds) {
          notify({
            recipient: memberId,
            type: "group_message",
            actor: userId,
            groupId,
            body: text,
          });
        }

        // ── Real-time AI smart replies for group ──────────────────────
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
        logger.error("sendGroupMessage error:", err);
        socket.emit("error", { message: "Failed to send group message" });
      }
    });

    // ── Join / Leave Group Room ───────────────────────────────────────
    socket.on("joinGroup", async ({ groupId } = {}) => {
      if (!isId(groupId)) return;
      const isMember = await Group.exists({
        _id: groupId,
        "members.user": userId,
      });
      if (isMember) socket.join(`group:${groupId}`);
    });

    socket.on("leaveGroup", ({ groupId } = {}) => {
      if (groupId) socket.leave(`group:${groupId}`);
    });

    // ── 1:1 call signaling ───────────────────────────────────────────
    socket.on("callUser", async ({ toUserId, callType } = {}) => {
      if (!isId(toUserId) || toUserId === userId) return;
      const type = callType === "audio" ? "audio" : "video";
      pendingCalls.set(callKey(userId, toUserId), { callType: type });

      if (!isOnline(toUserId)) {
        // Nobody to ring — tell the caller and leave a missed call
        recordMissedCall(userId, toUserId);
        socket.emit("callUnavailable", { toUserId, reason: "offline" });
        return;
      }

      // Name and avatar come from the database so callers can't impersonate anyone
      const caller = await User.findById(userId).select("name avatar").lean();
      io.to(toUserId).emit("incomingCall", {
        callerId: userId,
        callerName: caller?.name,
        callerAvatar: caller?.avatar,
        callType: type,
      });
    });
    socket.on("callAccepted", ({ toUserId } = {}) => {
      if (!isId(toUserId)) return;
      pendingCalls.delete(callKey(toUserId, userId));
      io.to(toUserId).emit("callAccepted", { calleeId: userId });
    });
    socket.on("callRejected", ({ toUserId, reason } = {}) => {
      if (!isId(toUserId)) return;
      // The ring timed out unanswered → missed call; an explicit decline is not
      if (reason === "timeout") recordMissedCall(toUserId, userId);
      else pendingCalls.delete(callKey(toUserId, userId));
      io.to(toUserId).emit("callRejected", { calleeId: userId, reason });
    });
    socket.on("endCall", ({ toUserId } = {}) => {
      if (!isId(toUserId)) return;
      // Caller hung up before the callee answered
      recordMissedCall(userId, toUserId);
      io.to(toUserId).emit("callEnded", { byUserId: userId });
    });
    socket.on("webrtcOffer", ({ toUserId, offer } = {}) => {
      if (isId(toUserId))
        io.to(toUserId).emit("webrtcOffer", { fromUserId: userId, offer });
    });
    socket.on("webrtcAnswer", ({ toUserId, answer } = {}) => {
      if (isId(toUserId))
        io.to(toUserId).emit("webrtcAnswer", { fromUserId: userId, answer });
    });
    socket.on("iceCandidate", ({ toUserId, candidate } = {}) => {
      if (isId(toUserId))
        io.to(toUserId).emit("iceCandidate", { fromUserId: userId, candidate });
    });

    // ── Typing indicators ────────────────────────────────────────────
    socket.on("typing", ({ receiverId, groupId } = {}) => {
      if (isId(receiverId)) io.to(receiverId).emit("typing", { senderId: userId });
      else if (isId(groupId))
        socket
          .to(`group:${groupId}`)
          .emit("typing", { senderId: userId, groupId });
    });
    socket.on("stopTyping", ({ receiverId, groupId } = {}) => {
      if (isId(receiverId))
        io.to(receiverId).emit("stopTyping", { senderId: userId });
      else if (isId(groupId))
        socket
          .to(`group:${groupId}`)
          .emit("stopTyping", { senderId: userId, groupId });
    });

    // ── Disconnect ───────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      const tabs = onlineUsers.get(userId);
      tabs?.delete(socket.id);
      if (tabs?.size) return; // still open in another tab

      onlineUsers.delete(userId);
      redisRemoveOnline(userId);
      // A caller who drops mid-ring leaves the callee a missed call
      for (const key of pendingCalls.keys()) {
        const [callerId, calleeId] = key.split(":");
        if (callerId === userId) {
          recordMissedCall(callerId, calleeId);
          io.to(calleeId).emit("callEnded", { byUserId: userId });
        }
      }
      markOffline(userId);
    });
  });

  return io;
}
