import { rateLimit, ipKeyGenerator } from "express-rate-limit";

/**
 * The client's IP without a port. Azure App Service sends
 * X-Forwarded-For as "1.2.3.4:51234", so req.ip changes on every
 * connection — keying on it raw would make every request look new.
 */
export function clientIp(req) {
  const raw = String(req.ip ?? "");
  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(raw); // [2001:db8::1]:443
  if (bracketed) return bracketed[1];
  const v4WithPort = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/.exec(raw);
  if (v4WithPort) return v4WithPort[1];
  return raw;
}

// ipKeyGenerator groups IPv6 addresses by subnet so one client can't rotate addresses
const ipKey = (req) => ipKeyGenerator(clientIp(req));

export const createLimiter = ({ windowMs, limit, message, keyGenerator = ipKey }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message },
    keyGenerator,
    // req.ip may carry a port on Azure; clientIp() normalizes it instead
    validate: { ip: false },
  });

// Password / 2FA sign-in attempts per IP
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "Too many sign-in attempts. Please try again in 15 minutes.",
});

// Sending OTP emails costs money and can be abused to spam inboxes
export const otpLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: "Too many verification emails requested. Please try again later.",
});

// AI calls are billed per token — limit per signed-in user (fallback: IP)
export const aiLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  message: "You're sending AI requests too quickly. Please wait a moment.",
  keyGenerator: (req) => req.user?._id?.toString() ?? ipKey(req),
});
