import mongoose from "mongoose";
import User from "../models/user.model.js";
import { cloudinary } from "../config/cloudinary.js";

// Fields any logged-in user may see about someone else. Never email,
// auth provider, GitHub id or security settings.
export const PUBLIC_PROFILE_FIELDS =
  "name username avatar bio isOnline lastSeen createdAt";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_DATA_URL_RE = /^data:image\/(png|jpe?g|gif|webp);base64,/;
const NAME_MIN = 2;
const NAME_MAX = 50;
const BIO_MAX = 300;
const MAX_LIST_LIMIT = 50;

// Escape user input before using it inside a RegExp
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const clampLimit = (value, fallback) =>
  Math.min(MAX_LIST_LIMIT, Math.max(1, parseInt(value, 10) || fallback));

// Cloudinary URL → public id, e.g. ".../upload/v123/avatars/abc.jpg" → "avatars/abc"
const cloudinaryPublicId = (url) => {
  const match = /\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i.exec(url);
  return match ? match[1] : null;
};

// @desc    Get user profile by ID
// @route   GET /api/profile/:userId
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(userId).select(PUBLIC_PROFILE_FIELDS);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-refreshToken -password",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching current profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio, avatar, name } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ── Validate everything before touching Cloudinary or the DB ──
    let nextName;
    if (name !== undefined) {
      nextName = String(name).trim();
      if (nextName.length < NAME_MIN || nextName.length > NAME_MAX) {
        return res.status(400).json({
          message: `Name must be ${NAME_MIN}-${NAME_MAX} characters`,
        });
      }
    }

    let nextUsername;
    if (username !== undefined) {
      nextUsername = String(username).toLowerCase().trim();
      if (!USERNAME_RE.test(nextUsername)) {
        return res.status(400).json({
          message:
            "Username must be 3-20 characters (letters, numbers, underscore only)",
        });
      }
      if (nextUsername !== user.username) {
        const taken = await User.exists({
          username: nextUsername,
          _id: { $ne: userId },
        });
        if (taken) {
          return res.status(409).json({ message: "Username already taken" });
        }
      }
    }

    let nextBio;
    if (bio !== undefined) {
      nextBio = String(bio).trim();
      if (nextBio.length > BIO_MAX) {
        return res
          .status(400)
          .json({ message: `Bio must be at most ${BIO_MAX} characters` });
      }
    }

    if (avatar && !AVATAR_DATA_URL_RE.test(avatar)) {
      return res
        .status(400)
        .json({ message: "Avatar must be a PNG, JPEG, GIF or WebP image" });
    }

    // ── Avatar: upload the new one first so a failed upload keeps the old ──
    if (avatar) {
      const oldAvatar = user.avatar;
      const uploadResponse = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto" },
        ],
      });
      user.avatar = uploadResponse.secure_url;

      const oldPublicId =
        oldAvatar?.includes("res.cloudinary.com") &&
        cloudinaryPublicId(oldAvatar);
      if (oldPublicId) {
        cloudinary.uploader.destroy(oldPublicId).catch((err) => {
          console.warn("Failed to delete old avatar:", err.message);
        });
      }
    }

    if (nextName !== undefined) user.name = nextName;
    if (nextUsername !== undefined) user.username = nextUsername;
    if (nextBio !== undefined) user.bio = nextBio;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user email
// @route   PUT /api/profile/update-email
// @access  Private
export const updateEmail = async (req, res) => {
  try {
    const email = String(req.body.email ?? "")
      .toLowerCase()
      .trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email },
      { new: true, runValidators: true },
    ).select("-refreshToken -password");

    res
      .status(200)
      .json({ success: true, message: "Email updated successfully", user });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update online status
// @route   PUT /api/profile/online-status
// @access  Private
export const updateOnlineStatus = async (req, res) => {
  try {
    const isOnline = Boolean(req.body.isOnline);

    const updateFields = isOnline
      ? { isOnline }
      : { isOnline, lastSeen: new Date() };

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
    }).select("-refreshToken -password");

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error updating online status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/profile/delete
// @access  Private
export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Search users by username or name
// @route   GET /api/profile/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const query = String(req.query.query ?? "").trim();

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const pattern = escapeRegex(query.slice(0, 50));
    const users = await User.find({
      $or: [
        { username: { $regex: pattern, $options: "i" } },
        { name: { $regex: pattern, $options: "i" } },
      ],
    })
      .select(PUBLIC_PROFILE_FIELDS)
      .limit(clampLimit(req.query.limit, 10));

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all users
// @route   GET /api/profile/all
// @access  Private
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = clampLimit(req.query.limit, 20);

    const users = await User.find()
      .select(PUBLIC_PROFILE_FIELDS)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ message: "Server error" });
  }
};
