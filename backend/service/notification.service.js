import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socket/io.js";
import logger from "../utils/logger.js";

// Notification type → the user preference that switches it off
const PREF_FOR_TYPE = {
  message: "messages",
  group_message: "groupMessages",
  friend_request: "friendRequests",
  friend_accepted: "friendRequests",
  group_added: "groups",
  missed_call: "calls",
};

const MESSAGE_TYPES = new Set(["message", "group_message"]);
const PREVIEW_LENGTH = 140;

export const NOTIFICATION_POPULATE = [
  { path: "actor", select: "name username avatar" },
  { path: "groupId", select: "name avatar" },
];

export const chatKey = ({ conversationId, groupId }) =>
  conversationId ? `dm:${conversationId}` : groupId ? `group:${groupId}` : null;

const emitTo = (userId, event, payload) =>
  getIO()?.to(String(userId)).emit(event, payload);

/**
 * True when one of the recipient's open tabs is looking at this chat right
 * now (clients report it with the `activeChat` socket event) — then a
 * notification would only be noise.
 */
async function isViewingChat(recipient, keys) {
  const io = getIO();
  if (!io) return false;
  const sockets = await io.in(String(recipient)).fetchSockets();
  return sockets.some((s) => keys.includes(s.data.activeChat));
}

/**
 * Create (or, for messages, collapse into the chat's unread notification)
 * and push it to the recipient's open tabs. Never throws — a failed
 * notification must not fail the action that triggered it.
 */
export async function notify({
  recipient,
  type,
  actor,
  conversationId,
  groupId,
  requestId,
  body = null,
  meta,
}) {
  try {
    if (!recipient || String(recipient) === String(actor)) return null;

    const prefKey = PREF_FOR_TYPE[type];
    const user = await User.findById(recipient).select("notificationPrefs").lean();
    if (!user || user.notificationPrefs?.[prefKey] === false) return null;

    const preview = body ? String(body).slice(0, PREVIEW_LENGTH) : null;
    let doc;

    if (MESSAGE_TYPES.has(type)) {
      const groupKey = chatKey({ conversationId, groupId });
      const viewingKeys = [groupKey, actor && `peer:${actor}`].filter(Boolean);
      if (await isViewingChat(recipient, viewingKeys)) return null;

      doc = await Notification.findOneAndUpdate(
        { recipient, groupKey, read: false },
        {
          $set: { type, actor, conversationId, groupId, body: preview, meta },
          $inc: { count: 1 },
        },
        { new: true, upsert: true },
      );
    } else {
      doc = await Notification.create({
        recipient,
        type,
        actor,
        conversationId,
        groupId,
        requestId,
        body: preview,
        meta,
        count: 1,
      });
    }

    await doc.populate(NOTIFICATION_POPULATE);
    const unreadCount = await Notification.countDocuments({ recipient, read: false });
    emitTo(recipient, "notification:new", {
      notification: doc.toObject(),
      unreadCount,
    });
    return doc;
  } catch (err) {
    logger.error(`notify(${type}) failed`, err);
    return null;
  }
}

// Remove a friend-request notification once the request is answered or cancelled
export async function removeRequestNotifications(requestId) {
  try {
    const docs = await Notification.find({ requestId }).select("_id recipient").lean();
    if (!docs.length) return;
    await Notification.deleteMany({ requestId });
    for (const d of docs) {
      emitTo(d.recipient, "notification:removed", { id: d._id });
    }
  } catch (err) {
    logger.error("removeRequestNotifications failed", err);
  }
}

export { emitTo as emitToUser };
