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
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
