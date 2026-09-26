import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  WrongPassphraseError,
  decryptText,
  deriveConversationKey,
  encryptText,
  fingerprintOf,
  generateIdentityKeyPair,
  messageAad,
  safetyNumber,
  toNonExtractable,
  unwrapPrivateKey,
  wrapPrivateKey,
} from "./crypto.js";

const ALICE = "64b0000000000000000000a1";
const BOB = "64b0000000000000000000b2";
const FAST = 1000; // PBKDF2 iterations for tests only

async function party(id) {
  const { privateKey, publicJwk } = await generateIdentityKeyPair();
  return { id, privateKey, publicJwk, fp: await fingerprintOf(publicJwk) };
}

describe("fingerprints", () => {
  it("match the server's computation", async () => {
    const { publicJwk } = await generateIdentityKeyPair();
    const expected = createHash("sha256")
      .update(`${publicJwk.crv}.${publicJwk.x}.${publicJwk.y}`)
      .digest("hex")
      .slice(0, 32);
    assert.equal(await fingerprintOf(publicJwk), expected);
  });
});

describe("conversation keys and messages", () => {
  it("both sides derive the same key and can read each other", async () => {
    const alice = await party(ALICE);
    const bob = await party(BOB);
    const kA = await deriveConversationKey(alice.privateKey, bob.publicJwk, ALICE, BOB);
    const kB = await deriveConversationKey(bob.privateKey, alice.publicJwk, BOB, ALICE);

    const aad = messageAad({ senderId: ALICE, recipientId: BOB, sk: alice.fp, rk: bob.fp });
    const envelope = await encryptText(kA, "Hi Bob — **secret** plans 🤫", aad);
    assert.equal(await decryptText(kB, envelope, aad), "Hi Bob — **secret** plans 🤫");
    // The sender can read their own message too (other devices, history)
    assert.equal(await decryptText(kA, envelope, aad), "Hi Bob — **secret** plans 🤫");
  });

  it("uses a fresh IV every time", async () => {
    const alice = await party(ALICE);
    const bob = await party(BOB);
    const k = await deriveConversationKey(alice.privateKey, bob.publicJwk, ALICE, BOB);
    const aad = messageAad({ senderId: ALICE, recipientId: BOB, sk: alice.fp, rk: bob.fp });
    const a = await encryptText(k, "same", aad);
    const b = await encryptText(k, "same", aad);
    assert.notEqual(a.iv, b.iv);
    assert.notEqual(a.ct, b.ct);
  });

  it("rejects tampered ciphertext and misattributed senders", async () => {
    const alice = await party(ALICE);
    const bob = await party(BOB);
    const k = await deriveConversationKey(alice.privateKey, bob.publicJwk, ALICE, BOB);
    const aad = messageAad({ senderId: ALICE, recipientId: BOB, sk: alice.fp, rk: bob.fp });
    const env = await encryptText(k, "pay 10", aad);

    const flipped = Buffer.from(env.ct, "base64");
    flipped[0] ^= 1;
    await assert.rejects(decryptText(k, { ...env, ct: flipped.toString("base64") }, aad));

    // Server claims Bob sent it → authentication fails
    const swapped = messageAad({ senderId: BOB, recipientId: ALICE, sk: bob.fp, rk: alice.fp });
    await assert.rejects(decryptText(k, env, swapped));
  });

  it("a third party can't read the conversation", async () => {
    const alice = await party(ALICE);
    const bob = await party(BOB);
    const eve = await party("64b0000000000000000000e3");
    const kA = await deriveConversationKey(alice.privateKey, bob.publicJwk, ALICE, BOB);
    const kEve = await deriveConversationKey(eve.privateKey, alice.publicJwk, BOB, ALICE);
    const aad = messageAad({ senderId: ALICE, recipientId: BOB, sk: alice.fp, rk: bob.fp });
    const env = await encryptText(kA, "hello", aad);
    await assert.rejects(decryptText(kEve, env, aad));
  });
});

describe("passphrase backup", () => {
  it("round-trips with the right passphrase and a usable key", async () => {
    const alice = await party(ALICE);
    const bob = await party(BOB);
    const backup = await wrapPrivateKey(alice.privateKey, "correct horse battery", alice.fp, FAST);
    assert.equal(backup.iterations, FAST);

    const restored = await unwrapPrivateKey(backup, "correct horse battery", alice.fp);
    const k1 = await deriveConversationKey(restored, bob.publicJwk, ALICE, BOB);
    const k2 = await deriveConversationKey(bob.privateKey, alice.publicJwk, BOB, ALICE);
    const aad = messageAad({ senderId: BOB, recipientId: ALICE, sk: bob.fp, rk: alice.fp });
    assert.equal(await decryptText(k1, await encryptText(k2, "ok", aad), aad), "ok");
  });

  it("rejects a wrong passphrase", async () => {
    const alice = await party(ALICE);
    const backup = await wrapPrivateKey(alice.privateKey, "right one", alice.fp, FAST);
    await assert.rejects(unwrapPrivateKey(backup, "wrong one", alice.fp), WrongPassphraseError);
  });

  it("rejects a backup that belongs to a different key", async () => {
    const alice = await party(ALICE);
    const backup = await wrapPrivateKey(alice.privateKey, "pass", alice.fp, FAST);
    await assert.rejects(unwrapPrivateKey(backup, "pass", "f".repeat(32)), WrongPassphraseError);
  });

  it("device copies of the key can't be exported", async () => {
    const { privateKey } = await generateIdentityKeyPair();
    const locked = await toNonExtractable(privateKey);
    assert.equal(locked.extractable, false);
    await assert.rejects(globalThis.crypto.subtle.exportKey("pkcs8", locked));
  });
});

describe("safety numbers", () => {
  it("are 12 groups of 5 digits and the same for both people", async () => {
    const a = "a".repeat(32);
    const b = "b".repeat(32);
    const n1 = await safetyNumber(a, b);
    assert.match(n1, /^(\d{5} ){11}\d{5}$/);
    assert.equal(await safetyNumber(b, a), n1);
    assert.notEqual(await safetyNumber(a, "c".repeat(32)), n1);
  });
});
