import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMail = vi.fn().mockResolvedValue(true);
vi.mock("../service/Nodemailer.js", () => ({ default: { sendMail } }));

process.env.JWT_SECRET = "test_secret";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret";

const tokens = await import("../service/token.service.js");
const otp = await import("../service/otp.service.js");
const mail = await import("../service/mail.service.js");

describe("token.service", () => {
  it("stores refresh tokens hashed and matches them", () => {
    const user = { _id: "64b000000000000000000001" };
    const { accessToken, refreshToken } = tokens.issueSession(user);

    expect(tokens.verifyAccessToken(accessToken).userId).toBe(user._id);
    expect(user.refreshToken).not.toBe(refreshToken);
    expect(user.refreshToken).toBe(tokens.hashToken(refreshToken));
    expect(tokens.refreshTokenMatches(user.refreshToken, refreshToken)).toBe(true);
    expect(tokens.refreshTokenMatches(user.refreshToken, "other")).toBe(false);
    expect(user.isOnline).toBe(true);
  });

  it("still accepts refresh tokens stored before hashing was introduced", () => {
    expect(tokens.refreshTokenMatches("legacy-raw-token", "legacy-raw-token")).toBe(true);
    expect(tokens.refreshTokenMatches(null, "x")).toBe(false);
  });
});

describe("otp.service (memory fallback)", () => {
  const email = "pending@example.com";
  beforeEach(() => otp.deletePendingRegistration(email));

  it("generates 6-digit codes", () => {
    for (let i = 0; i < 50; i++) expect(otp.generateOTP()).toMatch(/^\d{6}$/);
  });

  it("saves, reads and deletes a pending registration", async () => {
    await otp.savePendingRegistration(email, { otp: "123456", name: "A" });
    expect(await otp.getPendingRegistration(email)).toMatchObject({ otp: "123456" });
    await otp.deletePendingRegistration(email);
    expect(await otp.getPendingRegistration(email)).toBeNull();
  });

  it("locks the code out after the maximum wrong attempts", async () => {
    await otp.savePendingRegistration(email, { otp: "123456" });
    for (let i = 1; i < otp.MAX_OTP_ATTEMPTS; i++) {
      const record = await otp.getPendingRegistration(email);
      expect(await otp.recordFailedAttempt(email, record)).toBe(false);
    }
    const record = await otp.getPendingRegistration(email);
    expect(await otp.recordFailedAttempt(email, record)).toBe(true);
    expect(await otp.getPendingRegistration(email)).toBeNull();
  });

  it("treats expired records as missing", async () => {
    vi.useFakeTimers();
    await otp.savePendingRegistration(email, { otp: "123456" });
    vi.advanceTimersByTime(otp.OTP_TTL_SECONDS * 1000 + 1);
    expect(await otp.getPendingRegistration(email)).toBeNull();
    vi.useRealTimers();
  });
});

describe("mail.service", () => {
  beforeEach(() => sendMail.mockClear());

  it("escapes HTML in user-supplied names", async () => {
    await mail.sendOtpEmail("a@b.com", "123456", '<a href="https://evil">x</a>');
    const { html } = sendMail.mock.calls[0][0];
    expect(html).not.toContain('<a href="https://evil">');
    expect(html).toContain("&lt;a href=&quot;https://evil&quot;&gt;");
  });
});
