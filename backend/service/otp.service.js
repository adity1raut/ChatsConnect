import crypto from "crypto";
import { getRedis } from "../cache/redis.js";

// Pending registrations wait here until the emailed code is confirmed.
// Redis keeps them across restarts and instances; memory is the fallback.
export const OTP_TTL_SECONDS = 10 * 60;
export const MAX_OTP_ATTEMPTS = 5;

const memoryStore = new Map();
const key = (email) => `otp:pending:${email}`;

// 6-digit code from a cryptographically secure RNG
export const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

export async function savePendingRegistration(email, data) {
  const record = { ...data, expiresAt: Date.now() + OTP_TTL_SECONDS * 1000 };
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(key(email), JSON.stringify(record), "EX", OTP_TTL_SECONDS);
      memoryStore.delete(email);
      return record;
    } catch {
      // Redis hiccup — fall through to memory
    }
  }
  memoryStore.set(email, record);
  return record;
}

export async function getPendingRegistration(email) {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get(key(email));
      if (raw) return JSON.parse(raw);
    } catch {
      // Redis hiccup — fall through to memory
    }
  }
  const record = memoryStore.get(email);
  if (record && record.expiresAt < Date.now()) {
    memoryStore.delete(email);
    return null;
  }
  return record ?? null;
}

export async function deletePendingRegistration(email) {
  memoryStore.delete(email);
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(key(email));
    } catch {
      // Expires on its own via TTL
    }
  }
}

/**
 * Record a wrong guess. Returns true when the code is now locked out
 * (the pending registration is deleted and a new code must be requested).
 */
export async function recordFailedAttempt(email, record) {
  const attempts = (record.attempts || 0) + 1;
  if (attempts >= MAX_OTP_ATTEMPTS) {
    await deletePendingRegistration(email);
    return true;
  }
  const remainingSeconds = Math.max(
    1,
    Math.ceil((record.expiresAt - Date.now()) / 1000),
  );
  const updated = { ...record, attempts };
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(key(email), JSON.stringify(updated), "EX", remainingSeconds);
      return false;
    } catch {
      // fall through
    }
  }
  memoryStore.set(email, updated);
  return false;
}
