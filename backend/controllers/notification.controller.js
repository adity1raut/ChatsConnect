import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  NOTIFICATION_POPULATE,
  chatKey,
  emitToUser,
} from "../service/notification.service.js";

const DEFAULT_PREFS = {
  messages: true,
  groupMessages: true,
  friendRequests: true,
  groups: true,
  calls: true,
};

const unreadCountFor = (recipient) =>
  Notification.countDocuments({ recipient, read: false });

// GET /api/notifications?before=<iso>&limit=20&unread=true
export const listNotifications = async (req, res) => {
  const { before, limit, unread } = req.validated.query;
  const recipient = req.user._id;

  const filter = { recipient };
  if (before) filter.updatedAt = { $lt: new Date(before) };
  if (unread === "true") filter.read = false;

  const [docs, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit + 1)
      .populate(NOTIFICATION_POPULATE)
      .lean(),
    unreadCountFor(recipient),
  ]);

  res.json({
    notifications: docs.slice(0, limit),
    hasMore: docs.length > limit,
    unreadCount,
  });
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  res.json({ unreadCount: await unreadCountFor(req.user._id) });
};

// POST /api/notifications/read  { ids } | { all: true } | { conversationId } | { groupId }
export const markRead = async (req, res) => {
  const recipient = req.user._id;
  const { ids, all, conversationId, groupId } = req.body;
  const now = new Date();

  if (conversationId || groupId) {
    // Opening a chat: its message notifications have served their purpose
    await Notification.deleteMany({
      recipient,
      groupKey: chatKey({ conversationId, groupId }),
    });
  } else {
    const filter = { recipient, read: false };
    if (!all) filter._id = { $in: ids };
    await Notification.updateMany(filter, { read: true, readAt: now });
  }

  const unreadCount = await unreadCountFor(recipient);
  // Keep the user's other tabs in sync
  emitToUser(recipient, "notifications:read", {
    ids,
    all: Boolean(all),
    chat: chatKey({ conversationId, groupId }),
    unreadCount,
  });
  res.json({ unreadCount });
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  const recipient = req.user._id;
  const { id } = req.validated.params;

  const deleted = await Notification.findOneAndDelete({ _id: id, recipient });
  if (!deleted) throw ApiError.notFound("Notification not found");

  const unreadCount = await unreadCountFor(recipient);
  emitToUser(recipient, "notification:removed", { id, unreadCount });
  res.json({ unreadCount });
};

// DELETE /api/notifications
export const clearNotifications = async (req, res) => {
  const recipient = req.user._id;
  await Notification.deleteMany({ recipient });
  emitToUser(recipient, "notifications:cleared", {});
  res.json({ unreadCount: 0 });
};

// GET /api/notifications/preferences
export const getPreferences = async (req, res) => {
  const user = await User.findById(req.user._id).select("notificationPrefs").lean();
  res.json({ preferences: { ...DEFAULT_PREFS, ...user?.notificationPrefs } });
};

// PUT /api/notifications/preferences  { messages?, groupMessages?, ... }
export const updatePreferences = async (req, res) => {
  const $set = Object.fromEntries(
    Object.entries(req.body).map(([key, value]) => [`notificationPrefs.${key}`, value]),
  );
  const user = await User.findByIdAndUpdate(req.user._id, { $set }, { new: true })
    .select("notificationPrefs")
    .lean();
  res.json({ preferences: { ...DEFAULT_PREFS, ...user?.notificationPrefs } });
};
