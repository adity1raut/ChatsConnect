import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import Notification from "../models/notification.model.js";
import { cloudinary } from "../config/cloudinary.js";
import { getIO } from "../socket/io.js";
import { setActivityVisibility } from "../service/presence.service.js";
import logger from "../utils/logger.js";

// Fields any logged-in user may see about someone else. Never email,
// auth provider, GitHub id or security settings.
export const PUBLIC_PROFILE_FIELDS =
  "name username avatar bio statusMessage location website isOnline lastSeen createdAt";

const PREVIEW_USER_FIELDS = "name username avatar";
const MUTUALS_PREVIEW = 6;

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_DATA_URL_RE = /^data:image\/(png|jpe?g|gif|webp);base64,/;
const NAME_MIN = 2;
const NAME_MAX = 50;
const BIO_MAX = 300;
const STATUS_MAX = 100;
const LOCATION_MAX = 60;
const WEBSITE_MAX = 200;
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

// Only http(s) links — never javascript: or data: URLs rendered as <a href>
function normalizeWebsite(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

// Ids of everyone this user is friends with
async function friendIdsOf(userId) {
  const accepted = await FriendRequest.find({
    status: "accepted",
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .select("sender receiver")
    .lean();
  return accepted.map((r) =>
    String(r.sender) === String(userId) ? String(r.receiver) : String(r.sender),
  );
}

// @desc    Get user profile by ID, with friend count and what you share
// @route   GET /api/profile/:userId
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(userId).select(PUBLIC_PROFILE_FIELDS).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const viewerId = String(req.user._id);
    const isSelf = viewerId === String(userId);
    const [theirFriends, myFriends] = await Promise.all([
      friendIdsOf(userId),
      isSelf ? [] : friendIdsOf(viewerId),
    ]);

    let mutualFriends = { count: 0, users: [] };
    let mutualGroups = { count: 0, groups: [] };
    if (!isSelf) {
      const mine = new Set(myFriends);
      const mutualIds = theirFriends.filter((id) => mine.has(id));
      const groupFilter = { "members.user": { $all: [viewerId, userId] } };
      const [users, groups, groupCount] = await Promise.all([
        User.find({ _id: { $in: mutualIds.slice(0, MUTUALS_PREVIEW) } })
          .select(PREVIEW_USER_FIELDS)
          .lean(),
        Group.find(groupFilter).select("name avatar").limit(MUTUALS_PREVIEW).lean(),
        Group.countDocuments(groupFilter),
      ]);
      mutualFriends = { count: mutualIds.length, users };
      mutualGroups = { count: groupCount, groups };
    }

    res.status(200).json({
      success: true,
      user,
      friendCount: theirFriends.length,
      mutualFriends,
      mutualGroups,
    });
  } catch (error) {
    logger.error("Error fetching profile:", error);
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
    logger.error("Error fetching current profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio, avatar, name, statusMessage, location, website, privacy } =
      req.body;

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

    const textFields = {};
    for (const [key, value, max] of [
      ["statusMessage", statusMessage, STATUS_MAX],
      ["location", location, LOCATION_MAX],
    ]) {
      if (value === undefined) continue;
      const text = String(value).trim();
      if (text.length > max) {
        return res.status(400).json({ message: `${key} must be at most ${max} characters` });
      }
      textFields[key] = text;
    }

    let nextWebsite;
    if (website !== undefined) {
      nextWebsite = normalizeWebsite(website);
      if (nextWebsite === null || nextWebsite.length > WEBSITE_MAX) {
        return res.status(400).json({ message: "Website must be a valid http(s) link" });
      }
    }

    let showActivity;
    if (privacy?.showActivity !== undefined) {
      if (typeof privacy.showActivity !== "boolean") {
        return res.status(400).json({ message: "privacy.showActivity must be true or false" });
      }
      showActivity = privacy.showActivity;
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
          logger.warn("Failed to delete old avatar:", err.message);
        });
      }
    }

    if (nextName !== undefined) user.name = nextName;
    if (nextUsername !== undefined) user.username = nextUsername;
    if (nextBio !== undefined) user.bio = nextBio;
    Object.assign(user, textFields);
    if (nextWebsite !== undefined) user.website = nextWebsite;

    const visibilityChanged =
      showActivity !== undefined &&
      showActivity !== (user.privacy?.showActivity !== false);
    if (showActivity !== undefined) user.set("privacy.showActivity", showActivity);

    await user.save();
    if (visibilityChanged) await setActivityVisibility(user._id, showActivity);

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        statusMessage: user.statusMessage,
        location: user.location,
        website: user.website,
        privacy: { showActivity: user.privacy?.showActivity !== false },
      },
    });
  } catch (error) {
    logger.error("Error updating profile:", error);
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
    logger.error("Error updating email:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Turn two-step verification (emailed sign-in link) on or off
// @route   PUT /api/profile/two-factor
// @access  Private
export const updateTwoFactor = async (req, res) => {
  try {
    const { enabled, password } = req.body;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ message: "`enabled` must be true or false" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2FA guards the email/password login; GitHub sign-in never reaches it
    if (user.authProvider !== "LOCAL" || !user.password) {
      return res.status(400).json({
        message: "Two-step verification applies to email and password sign-in only",
      });
    }
    if (enabled && !user.email) {
      return res
        .status(400)
        .json({ message: "Add an email address before enabling two-step verification" });
    }

    // Changing a security setting requires re-entering the password
    const passwordOk =
      typeof password === "string" &&
      (await bcrypt.compare(password, user.password));
    if (!passwordOk) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.twoFactorEnabled = enabled;
    await user.save();

    res.status(200).json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
      message: enabled
        ? "Two-step verification enabled"
        : "Two-step verification disabled",
    });
  } catch (error) {
    logger.error("Error updating two-factor setting:", error);
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
    logger.error("Error updating online status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/profile/delete
// @access  Private
export const deleteProfile = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // A stolen session alone must not be enough to erase an account
    if (user.authProvider === "LOCAL") {
      const ok =
        typeof req.body?.password === "string" &&
        user.password &&
        (await bcrypt.compare(req.body.password, user.password));
      if (!ok) {
        return res.status(401).json({ message: "Password is incorrect" });
      }
    }

    // Leave every group: hand admin to someone else, delete emptied groups
    const groups = await Group.find({ "members.user": userId });
    for (const group of groups) {
      group.members = group.members.filter((m) => String(m.user) !== userId);
      if (!group.members.length) {
        await Group.deleteOne({ _id: group._id });
        continue;
      }
      if (!group.members.some((m) => m.role === "admin")) {
        group.members[0].role = "admin";
      }
      await group.save();
    }

    await Promise.all([
      FriendRequest.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
      Notification.deleteMany({ $or: [{ recipient: userId }, { actor: userId }] }),
    ]);

    const publicId =
      user.avatar?.includes("res.cloudinary.com") && cloudinaryPublicId(user.avatar);
    if (publicId) {
      cloudinary.uploader.destroy(publicId).catch((err) => {
        logger.warn(`Failed to delete avatar for ${userId}: ${err.message}`);
      });
    }

    // Messages stay so other people keep their chat history
    await User.deleteOne({ _id: userId });
    getIO()?.in(userId).disconnectSockets(true);

    res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    logger.error("Error deleting profile:", error);
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
    logger.error("Error searching users:", error);
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
    logger.error("Error listing users:", error);
    res.status(500).json({ message: "Server error" });
  }
};
