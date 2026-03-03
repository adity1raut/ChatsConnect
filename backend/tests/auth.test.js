import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock all external dependencies before importing the controller ---
vi.mock("../models/user.model.js", () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../service/Nodemailer.js", () => ({
  default: { sendMail: vi.fn().mockResolvedValue(true) },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn().mockReturnValue("mock_token"),
    verify: vi.fn(),
  },
}));

// Set required env vars before import
process.env.JWT_SECRET = "test_secret";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
process.env.EMAIL_USER = "test@example.com";
process.env.EMAIL_PASSWORD = "test_password";

const { requestOTP, verifyOTPAndRegister, login, logout, changePassword } =
  await import("../controllers/auth.controller.js");

const User = (await import("../models/user.model.js")).default;
const bcrypt = (await import("bcryptjs")).default;

// Helper to create mock req/res
const mockReqRes = (body = {}, params = {}, user = null) => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req: { body, params, user }, res };
};

// ─── requestOTP ────────────────────────────────────────────────────────────
describe("requestOTP", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when required fields are missing", async () => {
    const { req, res } = mockReqRes({ email: "a@b.com" });
    await requestOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("returns 400 for invalid email format", async () => {
    const { req, res } = mockReqRes({
      email: "not-an-email",
      username: "user1",
      password: "pass123",
      name: "Test User",
    });
    await requestOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid username format", async () => {
    const { req, res } = mockReqRes({
      email: "test@example.com",
      username: "a",
      password: "pass123",
      name: "Test User",
    });
    await requestOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if email already exists", async () => {
    User.findOne.mockResolvedValueOnce({ email: "test@example.com", username: "other" });
    const { req, res } = mockReqRes({
      email: "test@example.com",
      username: "newuser",
      password: "pass123",
      name: "Test User",
    });
    await requestOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email already exists" })
    );
  });

  it("returns 400 if username already taken", async () => {
    User.findOne.mockResolvedValueOnce({ email: "other@example.com", username: "newuser" });
    const { req, res } = mockReqRes({
      email: "test@example.com",
      username: "newuser",
      password: "pass123",
      name: "Test User",
    });
    await requestOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Username already taken" })
    );
  });

  it("returns 400 if password too short", async () => {
    User.findOne.mockResolvedValueOnce(null);
    const { req, res } = mockReqRes({
      email: "test@example.com",
      username: "newuser",
      password: "abc",
      name: "Test User",
    });
    await requestOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sends OTP and returns 200 on valid input", async () => {
    User.findOne.mockResolvedValueOnce(null);
    const { req, res } = mockReqRes({
      email: "test@example.com",
      username: "validuser",
      password: "pass123",
      name: "Test User",
    });
    await requestOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});

// ─── login ────────────────────────────────────────────────────────────────
describe("login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when fields are missing", async () => {
    const { req, res } = mockReqRes({ email: "test@example.com" });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 401 when user not found", async () => {
    User.findOne.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(null) });
    const { req, res } = mockReqRes({ email: "test@example.com", password: "pass123" });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 for OAuth account trying local login", async () => {
    const mockUser = { authProvider: "GITHUB", email: "test@example.com" };
    User.findOne.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(mockUser) });
    const { req, res } = mockReqRes({ email: "test@example.com", password: "pass123" });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when password is wrong", async () => {
    const mockUser = {
      _id: "user123",
      authProvider: "LOCAL",
      email: "test@example.com",
      password: "hashed",
      save: vi.fn(),
    };
    User.findOne.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(mockUser) });
    bcrypt.compare.mockResolvedValueOnce(false);
    const { req, res } = mockReqRes({ email: "test@example.com", password: "wrongpass" });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 200 with tokens on valid credentials", async () => {
    const mockUser = {
      _id: "user123",
      authProvider: "LOCAL",
      email: "test@example.com",
      password: "hashed",
      name: "Test",
      username: "test",
      avatar: "",
      bio: "",
      isOnline: false,
      lastSeen: null,
      createdAt: new Date(),
      save: vi.fn().mockResolvedValue(true),
    };
    User.findOne.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(mockUser) });
    bcrypt.compare.mockResolvedValueOnce(true);
    const { req, res } = mockReqRes({ email: "test@example.com", password: "pass123" });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, accessToken: "mock_token" })
    );
  });
});

// ─── logout ───────────────────────────────────────────────────────────────
describe("logout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates user and returns 200", async () => {
    User.findByIdAndUpdate.mockResolvedValueOnce({});
    const { req, res } = mockReqRes({}, {}, { _id: "user123" });
    await logout(req, res);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("user123", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── changePassword ────────────────────────────────────────────────────────
describe("changePassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when fields are missing", async () => {
    const { req, res } = mockReqRes({ currentPassword: "old" }, {}, { _id: "user123" });
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when new password is too short", async () => {
    const { req, res } = mockReqRes(
      { currentPassword: "old123", newPassword: "ab" },
      {},
      { _id: "user123" }
    );
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for OAuth user trying to change password", async () => {
    const mockUser = { _id: "user123", authProvider: "GITHUB", password: "hashed" };
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(mockUser) });
    const { req, res } = mockReqRes(
      { currentPassword: "old123", newPassword: "newpass123" },
      {},
      { _id: "user123" }
    );
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 401 when current password is wrong", async () => {
    const mockUser = { _id: "user123", authProvider: "LOCAL", password: "hashed" };
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(mockUser) });
    bcrypt.compare.mockResolvedValueOnce(false);
    const { req, res } = mockReqRes(
      { currentPassword: "wrongold", newPassword: "newpass123" },
      {},
      { _id: "user123" }
    );
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 200 on successful password change", async () => {
    const mockUser = {
      _id: "user123",
      authProvider: "LOCAL",
      password: "hashed",
      save: vi.fn().mockResolvedValue(true),
    };
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(mockUser) });
    bcrypt.compare.mockResolvedValueOnce(true);
    const { req, res } = mockReqRes(
      { currentPassword: "old123", newPassword: "newpass123" },
      {},
      { _id: "user123" }
    );
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
