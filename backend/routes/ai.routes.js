import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getAIStatus,
  toggleAI,
  smartReply,
  summarize,
  translate,
  sentiment,
  chat,
  healthCheck,
} from "../controllers/ai.controller.js";

const router = Router();

router.get("/health", healthCheck);

// Persistent AI toggle — stored in user document
router.get("/status", protect, getAIStatus);
router.put("/toggle", protect, toggleAI);

// AI features (all require auth)
router.post("/smart-reply", protect, smartReply);
router.post("/summarize", protect, summarize);
router.post("/translate", protect, translate);
router.post("/sentiment", protect, sentiment);
router.post("/chat", protect, chat);

export default router;
