import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "message",
  "group_message",
  "friend_request",
  "friend_accepted",
  "group_added",
  "missed_call",
];

const { ObjectId } = mongoose.Schema.Types;

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    actor: { type: ObjectId, ref: "User" },
    conversationId: { type: ObjectId, ref: "Conversation" },
    groupId: { type: ObjectId, ref: "Group" },
    requestId: { type: ObjectId, ref: "FriendRequest" },
    // Unread message notifications for the same chat collapse into one ("dm:<id>" / "group:<id>")
    groupKey: { type: String },
    // Preview text; null for end-to-end encrypted messages
    body: { type: String, maxlength: 200, default: null },
    meta: { type: mongoose.Schema.Types.Mixed },
    count: { type: Number, min: 1 },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, updatedAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, groupKey: 1, read: 1 });
// Old notifications clean themselves up
notificationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

export default mongoose.model("Notification", notificationSchema);
