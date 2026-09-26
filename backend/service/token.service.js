import crypto from "crypto";
import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL = "7d";

export const signAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

export const signRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

// Refresh tokens are stored hashed, so a database leak doesn't hand out sessions
export const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

export function refreshTokenMatches(stored, presented) {
  if (!stored || !presented) return false;
  const expected = Buffer.from(hashToken(presented), "hex");
  const actual = Buffer.from(String(stored), "hex");
  if (actual.length === expected.length && crypto.timingSafeEqual(actual, expected)) {
    return true;
  }
  // Sessions created before hashing was introduced stored the raw token
  return stored === presented;
}

/**
 * Start a session: sign both tokens and record the (hashed) refresh token and
 * presence on the user document. The caller saves the document.
 */
export function issueSession(user) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  user.refreshToken = hashToken(refreshToken);
  user.isOnline = true;
  user.lastSeen = new Date();
  return { accessToken, refreshToken };
}
