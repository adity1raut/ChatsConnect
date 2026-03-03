import express from "express";
import {
  getUserProfile,
  getCurrentUserProfile,
  updateProfile,
  updateEmail,
  updateOnlineStatus,
  deleteProfile,
  searchUsers,
  getAllUsers,
} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (specific paths before wildcard)
router.get("/search", searchUsers);
router.get("/all", getAllUsers);

// Protected routes (must be before /:userId to avoid wildcard conflict)
router.get("/me", protect, getCurrentUserProfile);
router.put("/update", protect, updateProfile);
router.put("/update-email", protect, updateEmail);
router.put("/online-status", protect, updateOnlineStatus);
router.delete("/delete", protect, deleteProfile);

// Wildcard route last
router.get("/:userId", getUserProfile);

export default router;
