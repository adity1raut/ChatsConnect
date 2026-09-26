/**
 * End-to-end encryption primitives (Web Crypto only — no dependencies).
 *
 * Scheme v1
 * - Identity: one ECDH P-256 key pair per account.
 * - Conversation key: ECDH(my private, peer public) → HKDF-SHA256
 *   (salt = both user ids, sorted) → AES-256-GCM.
 * - Message: AES-GCM with a random 96-bit IV. Sender, recipient and both
 *   key fingerprints are bound as additional authenticated data, so a
 *   message can't be replayed as coming from someone else.
 * - Key backup: private key (PKCS#8) encrypted with AES-GCM under a key
 *   derived from the user's passphrase (PBKDF2-SHA256), bound to the
 *   key's fingerprint. The server stores it but can't read it.
 */

export const E2EE_VERSION = 1;
export const PBKDF2_ITERATIONS = 600_000;

const subtle = globalThis.crypto.subtle;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ECDH = { name: "ECDH", namedCurve: "P-256" };
const HKDF_INFO = encoder.encode("chatsconnect-dm-v1");

export class WrongPassphraseError extends Error {
  constructor() {
    super("That passphrase doesn't unlock this key");
    this.name = "WrongPassphraseError";
  }
}

// ── Encoding ────────────────────────────────────────────────────────
export function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

const randomBytes = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));

const publicPart = ({ kty, crv, x, y }) => ({ kty, crv, x, y });

// ── Identity keys ──────────────────────────────────────────────────
/** New identity key pair. The private key is extractable only so it can be backed up. */
export async function generateIdentityKeyPair() {
  const pair = await subtle.generateKey(ECDH, true, ["deriveBits"]);
  const publicJwk = publicPart(await subtle.exportKey("jwk", pair.publicKey));
  return { privateKey: pair.privateKey, publicJwk };
}

/** First 128 bits of SHA-256("crv.x.y") as hex — matches the server */
export async function fingerprintOf(jwk) {
  const digest = await subtle.digest("SHA-256", encoder.encode(`${jwk.crv}.${jwk.x}.${jwk.y}`));
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Copy of a private key that can never be exported again (for device storage) */
export async function toNonExtractable(privateKey) {
  const pkcs8 = await subtle.exportKey("pkcs8", privateKey);
  return subtle.importKey("pkcs8", pkcs8, ECDH, false, ["deriveBits"]);
}

// ── Passphrase backup ──────────────────────────────────────────────
async function passphraseKey(passphrase, salt, iterations) {
  const base = await subtle.importKey(
    "raw",
    encoder.encode(passphrase.normalize("NFKC")),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

const backupAad = (fingerprint) => encoder.encode(`chatsconnect-key-backup-v1|${fingerprint}`);

/** Encrypt an (extractable) private key with a passphrase for server-side backup */
export async function wrapPrivateKey(privateKey, passphrase, fingerprint, iterations = PBKDF2_ITERATIONS) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const pkcs8 = await subtle.exportKey("pkcs8", privateKey);
  const key = await passphraseKey(passphrase, salt, iterations);
  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: backupAad(fingerprint) },
    key,
    pkcs8,
  );
  return {
    v: 1,
    ciphertext: toBase64(ciphertext),
    iv: toBase64(iv),
    salt: toBase64(salt),
    iterations,
  };
}

/**
 * Decrypt a backup. Fails with WrongPassphraseError for a wrong passphrase
 * or a backup that doesn't belong to `fingerprint`.
 */
export async function unwrapPrivateKey(backup, passphrase, fingerprint, { extractable = false } = {}) {
  const key = await passphraseKey(passphrase, fromBase64(backup.salt), backup.iterations);
  let pkcs8;
  try {
    pkcs8 = await subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(backup.iv), additionalData: backupAad(fingerprint) },
      key,
      fromBase64(backup.ciphertext),
    );
  } catch {
    throw new WrongPassphraseError();
  }
  return subtle.importKey("pkcs8", pkcs8, ECDH, extractable, ["deriveBits"]);
}

// ── Conversations ──────────────────────────────────────────────────
/** The AES key two people share. Both sides derive the same key. */
export async function deriveConversationKey(myPrivateKey, peerPublicJwk, myId, peerId) {
  const peerKey = await subtle.importKey(
    "jwk",
    { ...publicPart(peerPublicJwk), ext: true },
    ECDH,
    false,
    [],
  );
  const sharedBits = await subtle.deriveBits({ name: "ECDH", public: peerKey }, myPrivateKey, 256);
  const hkdfKey = await subtle.importKey("raw", sharedBits, "HKDF", false, ["deriveKey"]);
  return subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode([String(myId), String(peerId)].sort().join(":")),
      info: HKDF_INFO,
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Additional authenticated data binding a message to its sender, recipient and keys */
export const messageAad = ({ senderId, recipientId, sk, rk }) =>
  encoder.encode(`chatsconnect-dm-v1|${senderId}|${recipientId}|${sk}|${rk}`);

export async function encryptText(key, text, aad) {
  const iv = randomBytes(12);
  const ct = await subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad }, key, encoder.encode(text));
  return { iv: toBase64(iv), ct: toBase64(ct) };
}

/** Throws if the ciphertext, IV or authenticated data was tampered with */
export async function decryptText(key, { iv, ct }, aad) {
  const plaintext = await subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv), additionalData: aad },
    key,
    fromBase64(ct),
  );
  return decoder.decode(plaintext);
}

// ── Verification ───────────────────────────────────────────────────
/**
 * 60-digit security code both people can compare (in person, by phone).
 * Same result regardless of who computes it.
 */
export async function safetyNumber(fingerprintA, fingerprintB) {
  const [a, b] = [fingerprintA, fingerprintB].sort();
  const digest = new Uint8Array(
    await subtle.digest("SHA-512", encoder.encode(`chatsconnect-safety-v1|${a}|${b}`)),
  );
  const groups = [];
  for (let i = 0; i < 12; i++) {
    let n = 0;
    for (let j = 0; j < 5; j++) n = n * 256 + digest[i * 5 + j];
    groups.push(String(n % 100000).padStart(5, "0"));
  }
  return groups.join(" ");
}
