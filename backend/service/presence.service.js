import User from "../models/user.model.js";
import { getIO, hiddenPresence, isOnline } from "../socket/io.js";
import logger from "../utils/logger.js";

const save = (userId, update) =>
  User.updateOne({ _id: userId }, update).catch((err) =>
    logger.warn(`Presence update failed for ${userId}: ${err.message}`),
  );

// Load the user's privacy choice into memory (called when a socket connects)
export async function loadPresenceVisibility(userId) {
  const user = await User.findById(userId).select("privacy").lean();
  const hidden = user?.privacy?.showActivity === false;
  if (hidden) hiddenPresence.add(String(userId));
  else hiddenPresence.delete(String(userId));
  return !hidden;
}

// First tab connected
export async function markOnline(userId) {
  if (hiddenPresence.has(String(userId))) return;
  await save(userId, { isOnline: true });
  getIO()?.emit("userOnline", { userId: String(userId) });
}

// Last tab disconnected
export async function markOffline(userId) {
  if (hiddenPresence.has(String(userId))) return;
  const lastSeen = new Date();
  await save(userId, { isOnline: false, lastSeen });
  getIO()?.emit("userOffline", { userId: String(userId), lastSeen });
}

// User flipped "show my activity status" in their profile
export async function setActivityVisibility(userId, visible) {
  const id = String(userId);
  if (visible) {
    hiddenPresence.delete(id);
    if (isOnline(id)) await markOnline(id);
  } else {
    hiddenPresence.add(id);
    await save(id, { isOnline: false, lastSeen: null });
    getIO()?.emit("userOffline", { userId: id, lastSeen: null });
  }
}

// Online user ids that may be shown to others
export const visibleOnlineIds = (onlineIds) =>
  onlineIds.filter((id) => !hiddenPresence.has(id));
