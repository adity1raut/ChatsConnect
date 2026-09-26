import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For direct messages
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
    // For group messages
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    // Plain text; empty for end-to-end encrypted messages (see e2ee)
    content: {
      type: String,
      trim: true,
      default: "",
      required: function () {
        return !this.encrypted;
      },
    },
    encrypted: {
      type: Boolean,
      default: false,
    },
    // AES-GCM ciphertext for DMs; only the two participants hold the key
    e2ee: {
      type: new mongoose.Schema(
        {
          v: { type: Number, required: true }, // scheme version
          iv: { type: String, required: true }, // base64, 12 bytes
          ct: { type: String, required: true }, // base64 ciphertext + tag
          sk: { type: String, required: true }, // sender key fingerprint
          rk: { type: String, required: true }, // recipient key fingerprint
        },
        { _id: false },
      ),
      default: undefined,
    },
    messageType: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    // For group: track who has read the message
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
