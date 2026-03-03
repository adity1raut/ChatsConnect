import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getDMHistory,
  getGroupHistory,
  getConversations,
} from "../controllers/message.controller.js";

const router = express.Router();

// All message routes are protected
router.use(protect);

router.get("/conversations", getConversations);
router.get("/dm/:userId", getDMHistory);
router.get("/group/:groupId", getGroupHistory);

export default router;
