import crypto from "crypto";

// Scheme v1: ECDH P-256 identity keys → HKDF-SHA256 → AES-256-GCM per conversation
export const E2EE_VERSION = 1;
export const MAX_CIPHERTEXT_B64 = 30000; // ≈ 5,000 chars of UTF-8 text

const B64 = /^[A-Za-z0-9+/]+={0,2}$/;
const B64URL_32_BYTES = /^[A-Za-z0-9_-]{43}$/;
const FINGERPRINT = /^[0-9a-f]{32}$/;

export const isValidPublicJwk = (jwk) =>
  Boolean(jwk) &&
  jwk.kty === "EC" &&
  jwk.crv === "P-256" &&
  B64URL_32_BYTES.test(jwk.x ?? "") &&
  B64URL_32_BYTES.test(jwk.y ?? "");

/** Same computation as the client: first 128 bits of SHA-256("crv.x.y"), hex */
export const fingerprintOf = (jwk) =>
  crypto
    .createHash("sha256")
    .update(`${jwk.crv}.${jwk.x}.${jwk.y}`)
    .digest("hex")
    .slice(0, 32);

export const publicPart = (jwk) => ({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y });

/**
 * Validate an encrypted message envelope from a client. Returns the clean
 * envelope, or null if anything is malformed. The server never decrypts.
 */
export function parseEncryptedPayload(e2ee) {
  if (!e2ee || typeof e2ee !== "object") return null;
  const { v, iv, ct, sk, rk } = e2ee;
  if (v !== E2EE_VERSION) return null;
  if (typeof iv !== "string" || iv.length !== 16 || !B64.test(iv)) return null;
  if (typeof ct !== "string" || !ct || ct.length > MAX_CIPHERTEXT_B64 || !B64.test(ct)) return null;
  if (!FINGERPRINT.test(sk ?? "") || !FINGERPRINT.test(rk ?? "")) return null;
  return { v, iv, ct, sk, rk };
}
