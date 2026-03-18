import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";

// Map: userId -> socketId (for sending targeted events)
const onlineUsers = new Map();

// Map: groupId -> Map<userId, { name, avatar }>
const groupCalls = new Map();

// Singleton io — used by controllers to emit events (e.g. friend requests)
let _io = null;
export const getIO = () => _io;

export function initSocket(httpServer) {
  const allowedOrigins = [
    "https://www.chatsconnect.tech",
    process.env.CLIENT_URL,
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173"] : []),
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  _io = io; // store singleton for controller use

  // ── Auth middleware: verify JWT from handshake ──────────────────
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

    // Notify everyone this user is online
    socket.broadcast.emit("userOnline", { userId });

    // ── Join personal room so we can target this user ─────────────
    socket.join(userId);

    // ── Send Direct Message ───────────────────────────────────────
    socket.on("sendMessage", async ({ receiverId, content }) => {
      if (!receiverId || !content?.trim()) return;

      try {
        // Find or create conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [userId, receiverId] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [userId, receiverId],
          });
        }

        // Save message
        const message = await Message.create({
          senderId: userId,
          conversationId: conversation._id,
          content: content.trim(),
          messageType: "text",
          readBy: [userId],
        });

        // Update conversation lastMessage
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id).populate(
          "senderId",
          "name username avatar"
        );

        // Emit to receiver's room
        io.to(receiverId).emit("newMessage", {
          message: populatedMessage,
          conversationId: conversation._id,
        });

        // Emit back to sender (for confirmation / other tabs)
        socket.emit("newMessage", {
          message: populatedMessage,
          conversationId: conversation._id,
        });
      } catch (err) {
        console.error("sendMessage error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── Send Group Message ────────────────────────────────────────
    socket.on("sendGroupMessage", async ({ groupId, content }) => {
      if (!groupId || !content?.trim()) return;

      try {
        // Verify sender is a member
        const group = await Group.findOne({
          _id: groupId,
          "members.user": userId,
        });

        if (!group) {
          return socket.emit("error", { message: "Not a group member" });
        }

        const message = await Message.create({
          senderId: userId,
          groupId,
          content: content.trim(),
          messageType: "text",
          readBy: [userId],
        });

        // Update group lastMessage
        group.lastMessage = message._id;
        group.lastMessageAt = message.createdAt;
        await group.save();

        const populatedMessage = await Message.findById(message._id).populate(
          "senderId",
          "name username avatar"
        );

        // Emit to the group room (all members who have joined it)
        io.to(`group:${groupId}`).emit("newGroupMessage", {
          message: populatedMessage,
          groupId,
        });
      } catch (err) {
        console.error("sendGroupMessage error:", err);
        socket.emit("error", { message: "Failed to send group message" });
      }
    });

    // ── Join Group Room ───────────────────────────────────────────
    socket.on("joinGroup", async ({ groupId }) => {
      if (!groupId) return;
      const isMember = await Group.findOne({
        _id: groupId,
        "members.user": userId,
      });
      if (isMember) {
        socket.join(`group:${groupId}`);
      }
    });

    // ── Leave Group Room ──────────────────────────────────────────
    socket.on("leaveGroup", ({ groupId }) => {
      if (groupId) socket.leave(`group:${groupId}`);
    });

    // ── Group Call Signaling ────────────────────────────────────

    // Initiator starts a group call, notifies all group members
    socket.on("startGroupCall", ({ groupId, callType, callerName, callerAvatar }) => {
      if (!groupId) return;
      if (!groupCalls.has(groupId)) groupCalls.set(groupId, new Map());
      groupCalls.get(groupId).set(userId, { name: callerName || "User", avatar: callerAvatar || null });
      socket.join(`gcall:${groupId}`);
      // Notify all group members (they can choose to join)
      socket.to(`group:${groupId}`).emit("groupCallStarted", {
        groupId, callType, callerId: userId, callerName, callerAvatar,
      });
    });

    // A member joins an existing group call
    socket.on("joinGroupCall", ({ groupId, joinerName, joinerAvatar }) => {
      if (!groupId) return;
      const call = groupCalls.get(groupId);
      // Get existing participants before adding joiner
      const existingParticipants = call
        ? [...call.entries()].map(([uid, info]) => ({ userId: uid, ...info }))
        : [];
      // Send existing participant list to joiner so they can initiate WebRTC with each
      socket.emit("groupCallParticipants", { participants: existingParticipants, groupId });
      // Add joiner to call map and socket room
      if (!groupCalls.has(groupId)) groupCalls.set(groupId, new Map());
      groupCalls.get(groupId).set(userId, { name: joinerName || "User", avatar: joinerAvatar || null });
      socket.join(`gcall:${groupId}`);
      // Notify existing participants that someone new joined (they'll receive WebRTC offer from joiner)
      socket.to(`gcall:${groupId}`).emit("groupCallParticipantJoined", {
        userId, name: joinerName, avatar: joinerAvatar, groupId,
      });
    });

    // A participant leaves the group call
    socket.on("leaveGroupCall", ({ groupId }) => {
      if (!groupId) return;
      const call = groupCalls.get(groupId);
      if (call) {
        call.delete(userId);
        if (call.size === 0) groupCalls.delete(groupId);
      }
      socket.leave(`gcall:${groupId}`);
      socket.to(`gcall:${groupId}`).emit("groupCallParticipantLeft", { userId, groupId });
    });

    // ── WebRTC Signaling ─────────────────────────────────────────

    // Caller → Callee: ring the callee
    socket.on("callUser", ({ toUserId, callerName, callerAvatar, callType }) => {
      io.to(toUserId).emit("incomingCall", {
        callerId: userId,
        callerName,
        callerAvatar,
        callType, // "video" | "audio"
      });
    });

    // Callee → Caller: call accepted
    socket.on("callAccepted", ({ toUserId }) => {
      io.to(toUserId).emit("callAccepted", { calleeId: userId });
    });

    // Callee → Caller: call rejected
    socket.on("callRejected", ({ toUserId }) => {
      io.to(toUserId).emit("callRejected", { calleeId: userId });
    });

    // Either side → other: hang up
    socket.on("endCall", ({ toUserId }) => {
      io.to(toUserId).emit("callEnded", { byUserId: userId });
    });

    // Relay WebRTC offer
    socket.on("webrtcOffer", ({ toUserId, offer }) => {
      io.to(toUserId).emit("webrtcOffer", { fromUserId: userId, offer });
    });

    // Relay WebRTC answer
    socket.on("webrtcAnswer", ({ toUserId, answer }) => {
      io.to(toUserId).emit("webrtcAnswer", { fromUserId: userId, answer });
    });

    // Relay ICE candidates
    socket.on("iceCandidate", ({ toUserId, candidate }) => {
      io.to(toUserId).emit("iceCandidate", { fromUserId: userId, candidate });
    });

    // ── Typing indicators ─────────────────────────────────────────
    socket.on("typing", ({ receiverId, groupId }) => {
      if (receiverId) {
        io.to(receiverId).emit("typing", { senderId: userId });
      } else if (groupId) {
        socket.to(`group:${groupId}`).emit("typing", {
          senderId: userId,
          groupId,
        });
      }
    });

    socket.on("stopTyping", ({ receiverId, groupId }) => {
      if (receiverId) {
        io.to(receiverId).emit("stopTyping", { senderId: userId });
      } else if (groupId) {
        socket.to(`group:${groupId}`).emit("stopTyping", {
          senderId: userId,
          groupId,
        });
      }
    });

    // ── Disconnect ────────────────────────────────────────────────
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("userOffline", { userId });
      // Clean up any group calls this user was in
      for (const [groupId, call] of groupCalls.entries()) {
        if (call.has(userId)) {
          call.delete(userId);
          if (call.size === 0) groupCalls.delete(groupId);
          socket.to(`gcall:${groupId}`).emit("groupCallParticipantLeft", { userId, groupId });
        }
      }
    });
  });

  return io;
}

export { onlineUsers };
