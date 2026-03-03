import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getFriends,
  getFriendRequests,
  getSentRequests,
  removeFriend,
  getRelationship,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.use(protect);

// Relationship check (must be before /:userId to avoid conflict)
router.get("/requests", getFriendRequests);
router.get("/sent", getSentRequests);
router.get("/relationship/:userId", getRelationship);

// Core friend actions
router.get("/", getFriends);
router.post("/request/:userId", sendRequest);
router.put("/request/:requestId/accept", acceptRequest);
router.put("/request/:requestId/reject", rejectRequest);
router.delete("/request/:requestId/cancel", cancelRequest);
router.delete("/:userId", removeFriend);

export default router;
