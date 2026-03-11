import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import { cloudinary } from "../config/cloudinary.js";

// @desc    Get user profile by ID
// @route   GET /api/profile/:userId
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-refreshToken -password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendCount = await FriendRequest.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    });

    res.status(200).json({ success: true, user, friendCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken -password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

    // Update avatar if provided
    if (avatar) {
      // Delete old avatar from Cloudinary if it exists
      if (user.avatar && user.avatar.includes("cloudinary")) {
        const publicId = user.avatar.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
      }

      // Upload new avatar to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto" }
        ]
      });

      user.avatar = uploadResponse.secure_url;
    }

    // Update other fields
    if (name && name.trim().length >= 2) user.name = name.trim();
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;

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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user email
// @route   PUT /api/profile/update-email
// @access  Private
export const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email },
      { new: true, runValidators: true }
    ).select("-refreshToken -password");

    res.status(200).json({ success: true, message: "Email updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update online status
// @route   PUT /api/profile/online-status
// @access  Private
export const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;

    const updateFields = {
      isOnline,
      lastSeen: isOnline ? undefined : new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true }
    ).select("-refreshToken -password");

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/profile/delete
// @access  Private
export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Search users by username or name
// @route   GET /api/profile/search
// @access  Public
export const searchUsers = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ]
    })
      .select("-refreshToken -password")
      .limit(parseInt(limit));

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/profile/all
// @access  Public
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find()
      .select("-refreshToken -password")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};