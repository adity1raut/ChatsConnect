import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  smartReply,
  summarize,
  translate,
  sentiment,
  chat,
  healthCheck,
} from "../controllers/ai.controller.js";

const router = Router();

// All AI routes require authentication
router.get("/health", healthCheck);
router.post("/smart-reply", protect, smartReply);
router.post("/summarize", protect, summarize);
router.post("/translate", protect, translate);
router.post("/sentiment", protect, sentiment);
router.post("/chat", protect, chat);

export default router;
