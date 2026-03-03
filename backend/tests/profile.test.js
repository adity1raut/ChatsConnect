import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock dependencies ---
vi.mock("../models/user.model.js", () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../config/cloudinary.js", () => ({
  cloudinary: {
    uploader: {
      upload: vi.fn().mockResolvedValue({ secure_url: "https://cloudinary.com/avatar.jpg" }),
      destroy: vi.fn().mockResolvedValue({}),
    },
  },
}));

const {
  getUserProfile,
  getCurrentUserProfile,
  updateProfile,
  updateEmail,
  deleteProfile,
  searchUsers,
} = await import("../controllers/profile.controller.js");

const User = (await import("../models/user.model.js")).default;

const mockReqRes = (body = {}, params = {}, query = {}, user = null) => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req: { body, params, query, user }, res };
};

// ─── getUserProfile ────────────────────────────────────────────────────────
describe("getUserProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when user not found", async () => {
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(null) });
    const { req, res } = mockReqRes({}, { userId: "nonexistent" });
    await getUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 200 with user on success", async () => {
    const mockUser = { _id: "user123", name: "Test User", username: "testuser" };
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(mockUser) });
    const { req, res } = mockReqRes({}, { userId: "user123" });
    await getUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, user: mockUser })
    );
  });
});

// ─── getCurrentUserProfile ─────────────────────────────────────────────────
describe("getCurrentUserProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when user not found", async () => {
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(null) });
    const { req, res } = mockReqRes({}, {}, {}, { _id: "user123" });
    await getCurrentUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 200 with current user", async () => {
    const mockUser = { _id: "user123", name: "Test User" };
    User.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValueOnce(mockUser) });
    const { req, res } = mockReqRes({}, {}, {}, { _id: "user123" });
    await getCurrentUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── updateProfile ─────────────────────────────────────────────────────────
describe("updateProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when user not found", async () => {
    User.findById.mockResolvedValueOnce(null);
    const { req, res } = mockReqRes(
      { name: "New Name", username: "newuser", bio: "hello" },
      {},
      {},
      { _id: "user123" }
    );
    await updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates name, username, and bio and returns 200", async () => {
    const mockUser = {
      _id: "user123",
      name: "Old Name",
      username: "olduser",
      bio: "",
      avatar: "",
      email: "test@example.com",
      save: vi.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValueOnce(mockUser);
    const { req, res } = mockReqRes(
      { name: "New Name", username: "newuser", bio: "Updated bio" },
      {},
      {},
      { _id: "user123" }
    );
    await updateProfile(req, res);
    expect(mockUser.name).toBe("New Name");
    expect(mockUser.username).toBe("newuser");
    expect(mockUser.bio).toBe("Updated bio");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updates avatar via cloudinary when avatar string is provided", async () => {
    const mockUser = {
      _id: "user123",
      name: "Test",
      username: "testuser",
      bio: "",
      avatar: "",
      email: "test@example.com",
      save: vi.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValueOnce(mockUser);
    const { req, res } = mockReqRes(
      { username: "testuser", avatar: "data:image/png;base64,abc123" },
      {},
      {},
      { _id: "user123" }
    );
    await updateProfile(req, res);
    expect(mockUser.avatar).toBe("https://cloudinary.com/avatar.jpg");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── updateEmail ───────────────────────────────────────────────────────────
describe("updateEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when email is missing", async () => {
    const { req, res } = mockReqRes({}, {}, {}, { _id: "user123" });
    await updateEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when email is already in use", async () => {
    User.findOne.mockResolvedValueOnce({ _id: "other456" });
    const { req, res } = mockReqRes(
      { email: "taken@example.com" },
      {},
      {},
      { _id: "user123" }
    );
    await updateEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 on successful email update", async () => {
    User.findOne.mockResolvedValueOnce(null);
    const mockUser = { _id: "user123", email: "new@example.com" };
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce(mockUser),
    });
    const { req, res } = mockReqRes(
      { email: "new@example.com" },
      {},
      {},
      { _id: "user123" }
    );
    await updateEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── deleteProfile ─────────────────────────────────────────────────────────
describe("deleteProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes user and returns 200", async () => {
    User.findByIdAndDelete.mockResolvedValueOnce({});
    const { req, res } = mockReqRes({}, {}, {}, { _id: "user123" });
    await deleteProfile(req, res);
    expect(User.findByIdAndDelete).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── searchUsers ───────────────────────────────────────────────────────────
describe("searchUsers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when query is missing", async () => {
    const { req, res } = mockReqRes({}, {}, {});
    await searchUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns matched users on valid query", async () => {
    const mockUsers = [{ _id: "u1", username: "john" }];
    User.find.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce(mockUsers),
    });
    const { req, res } = mockReqRes({}, {}, { query: "john" });
    await searchUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, users: mockUsers })
    );
  });
});
