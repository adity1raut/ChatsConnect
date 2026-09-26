import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ["LOCAL", "GITHUB"],
      required: true,
    },
    githubId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 300,
    },
    // Short line shown under the name, e.g. "Out until Monday"
    statusMessage: { type: String, maxlength: 100, default: "" },
    location: { type: String, maxlength: 60, default: "" },
    website: { type: String, maxlength: 200, default: "" },
    privacy: {
      // false = never show online / last seen to anyone
      showActivity: { type: Boolean, default: true },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorToken: {
      type: String,
      select: false,
    },
    twoFactorTokenExpiry: {
      type: Date,
      select: false,
    },
    aiEnabled: {
      type: Boolean,
      default: false,
    },
    // End-to-end encryption identity (public parts are shared with others)
    e2ee: {
      publicKey: {
        kty: String,
        crv: String,
        x: String,
        y: String,
      },
      fingerprint: String,
      updatedAt: Date,
      // Private key encrypted with the user's passphrase — only its owner reads it
      backup: {
        type: new mongoose.Schema(
          {
            v: Number,
            ciphertext: String,
            iv: String,
            salt: String,
            iterations: Number,
          },
          { _id: false },
        ),
        select: false,
      },
      // Earlier public keys, so older messages stay readable after a key change
      history: [
        {
          _id: false,
          publicKey: { kty: String, crv: String, x: String, y: String },
          fingerprint: String,
          retiredAt: Date,
        },
      ],
    },
    // Which events create notifications (missing = on, for existing users)
    notificationPrefs: {
      messages: { type: Boolean, default: true },
      groupMessages: { type: Boolean, default: true },
      friendRequests: { type: Boolean, default: true },
      groups: { type: Boolean, default: true },
      calls: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
