import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import {
  chatSchema,
  sentimentSchema,
  smartReplySchema,
  summarizeSchema,
  translateSchema,
} from "../validators/ai.schemas.js";
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

// Model calls: signed in, rate limited per user, input size capped
router.post("/smart-reply", protect, aiLimiter, validate({ body: smartReplySchema }), smartReply);
router.post("/summarize", protect, aiLimiter, validate({ body: summarizeSchema }), summarize);
router.post("/translate", protect, aiLimiter, validate({ body: translateSchema }), translate);
router.post("/sentiment", protect, aiLimiter, validate({ body: sentimentSchema }), sentiment);
router.post("/chat", protect, aiLimiter, validate({ body: chatSchema }), chat);

export default router;
