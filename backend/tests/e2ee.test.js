import { describe, it, expect, vi, beforeEach } from "vitest";

const emit = vi.fn();
vi.mock("../socket/io.js", () => ({ getIO: () => ({ emit }) }));
vi.mock("../models/user.model.js", () => ({ default: { findById: vi.fn() } }));

const { parseEncryptedPayload, fingerprintOf, isValidPublicJwk } = await import(
  "../service/e2ee.service.js"
);
const { publishMyKey, getUserKeys, getMyKeys } = await import(
  "../controllers/keys.controller.js"
);
const User = (await import("../models/user.model.js")).default;
const bcrypt = (await import("bcryptjs")).default;

const USER_ID = "64b000000000000000000001";
const jwk = (seed) => ({
  kty: "EC",
  crv: "P-256",
  x: seed.padEnd(43, "A").slice(0, 43),
  y: seed.padEnd(43, "B").slice(0, 43),
});
const backup = { v: 1, ciphertext: "YWJj", iv: "AAAAAAAAAAAAAAAA", salt: "AAAAAAAAAAAAAAAAAAAAAAAA", iterations: 600000 };
const envelope = (over = {}) => ({
  v: 1,
  iv: "AAAAAAAAAAAAAAAA",
  ct: "c2VjcmV0",
  sk: "a".repeat(32),
  rk: "b".repeat(32),
  ...over,
});

describe("parseEncryptedPayload", () => {
  it("accepts a well-formed envelope", () => {
    expect(parseEncryptedPayload(envelope())).toEqual(envelope());
  });

  it("rejects malformed envelopes", () => {
    expect(parseEncryptedPayload(null)).toBeNull();
    expect(parseEncryptedPayload(envelope({ v: 2 }))).toBeNull();
    expect(parseEncryptedPayload(envelope({ iv: "short" }))).toBeNull();
    expect(parseEncryptedPayload(envelope({ ct: "not base64!!" }))).toBeNull();
    expect(parseEncryptedPayload(envelope({ ct: "A".repeat(30004) }))).toBeNull();
    expect(parseEncryptedPayload(envelope({ sk: "xyz" }))).toBeNull();
  });

  it("drops unexpected fields", () => {
    expect(parseEncryptedPayload(envelope({ plaintext: "leak" }))).not.toHaveProperty("plaintext");
  });
});

describe("fingerprintOf", () => {
  it("is deterministic and 32 hex chars", () => {
    const fp = fingerprintOf(jwk("key1"));
    expect(fp).toMatch(/^[0-9a-f]{32}$/);
    expect(fingerprintOf(jwk("key1"))).toBe(fp);
    expect(fingerprintOf(jwk("key2"))).not.toBe(fp);
  });

  it("validates JWK shape", () => {
    expect(isValidPublicJwk(jwk("k"))).toBe(true);
    expect(isValidPublicJwk({ ...jwk("k"), crv: "P-384" })).toBe(false);
  });
});

describe("keys controller", () => {
  beforeEach(() => vi.clearAllMocks());
  const res = () => ({ json: vi.fn() });

  it("publishes a first key without a password", async () => {
    const user = { _id: USER_ID, authProvider: "LOCAL", e2ee: {}, save: vi.fn() };
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValue(user) });
    const r = res();
    await publishMyKey({ user: { _id: USER_ID }, body: { publicKey: jwk("k1"), backup } }, r);
    expect(user.e2ee.fingerprint).toBe(fingerprintOf(jwk("k1")));
    expect(user.save).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith("keysChanged", expect.objectContaining({ userId: USER_ID }));
  });

  it("refuses to replace an existing key without the password", async () => {
    const user = {
      _id: USER_ID,
      authProvider: "LOCAL",
      password: await bcrypt.hash("pw", 4),
      e2ee: { publicKey: jwk("old"), fingerprint: fingerprintOf(jwk("old")), history: [] },
      save: vi.fn(),
    };
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValue(user) });
    await expect(
      publishMyKey({ user: { _id: USER_ID }, body: { publicKey: jwk("new"), backup, password: "nope" } }, res()),
    ).rejects.toMatchObject({ status: 401 });
    expect(user.save).not.toHaveBeenCalled();
  });

  it("keeps the retired key in history so old messages stay readable", async () => {
    const oldFp = fingerprintOf(jwk("old"));
    const user = {
      _id: USER_ID,
      authProvider: "LOCAL",
      password: await bcrypt.hash("pw", 4),
      e2ee: { publicKey: jwk("old"), fingerprint: oldFp, history: [] },
      save: vi.fn(),
    };
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValue(user) });
    await publishMyKey({ user: { _id: USER_ID }, body: { publicKey: jwk("new"), backup, password: "pw" } }, res());
    expect(user.e2ee.history[0].fingerprint).toBe(oldFp);
    expect(user.e2ee.fingerprint).toBe(fingerprintOf(jwk("new")));
  });

  it("never exposes the key backup through the public endpoint", async () => {
    User.findById.mockReturnValueOnce({
      select: () => ({
        lean: () =>
          Promise.resolve({
            e2ee: { publicKey: jwk("k"), fingerprint: fingerprintOf(jwk("k")), history: [], backup },
          }),
      }),
    });
    const r = res();
    await getUserKeys({ validated: { params: { userId: USER_ID } } }, r);
    const body = r.json.mock.calls[0][0];
    expect(body.hasKey).toBe(true);
    expect(body).not.toHaveProperty("backup");
  });

  it("returns the backup to its owner", async () => {
    User.findById.mockReturnValueOnce({
      select: () => ({
        lean: () =>
          Promise.resolve({ e2ee: { publicKey: jwk("k"), fingerprint: fingerprintOf(jwk("k")), backup } }),
      }),
    });
    const r = res();
    await getMyKeys({ user: { _id: USER_ID } }, r);
    expect(r.json.mock.calls[0][0].backup).toEqual(backup);
  });
});
