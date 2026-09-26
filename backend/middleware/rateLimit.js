import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const limiter = ({ windowMs, limit, message, keyGenerator }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message },
    ...(keyGenerator ? { keyGenerator } : {}),
  });

// Password / 2FA sign-in attempts per IP
export const authLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "Too many sign-in attempts. Please try again in 15 minutes.",
});

// Sending OTP emails costs money and can be abused to spam inboxes
export const otpLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: "Too many verification emails requested. Please try again later.",
});

// AI calls are billed per token — limit per signed-in user (fallback: IP)
export const aiLimiter = limiter({
  windowMs: 60 * 1000,
  limit: 20,
  message: "You're sending AI requests too quickly. Please wait a moment.",
  keyGenerator: (req) => req.user?._id?.toString() ?? ipKeyGenerator(req.ip),
});
