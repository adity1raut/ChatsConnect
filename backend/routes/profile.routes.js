import express from "express";
import {
  getUserProfile,
  getCurrentUserProfile,
  updateProfile,
  updateEmail,
  updateOnlineStatus,
  updateTwoFactor,
  deleteProfile,
  searchUsers,
  getAllUsers,
} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All profile routes require login — user lists and profiles are not public.
// Specific paths must come before the /:userId wildcard.
router.get("/search", protect, searchUsers);
router.get("/all", protect, getAllUsers);
router.get("/me", protect, getCurrentUserProfile);
router.put("/update", protect, updateProfile);
router.put("/update-email", protect, updateEmail);
router.put("/online-status", protect, updateOnlineStatus);
router.put("/two-factor", protect, updateTwoFactor);
router.delete("/delete", protect, deleteProfile);

// Wildcard route last
router.get("/:userId", protect, getUserProfile);

export default router;
