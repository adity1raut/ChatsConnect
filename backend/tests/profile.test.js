import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock dependencies ---
vi.mock("../models/user.model.js", () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
    exists: vi.fn(),
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../config/cloudinary.js", () => ({
  cloudinary: {
    uploader: {
      upload: vi
        .fn()
        .mockResolvedValue({ secure_url: "https://cloudinary.com/avatar.jpg" }),
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
  PUBLIC_PROFILE_FIELDS,
} = await import("../controllers/profile.controller.js");

const User = (await import("../models/user.model.js")).default;
const { cloudinary } = await import("../config/cloudinary.js");

// Valid 24-hex ObjectId strings
const USER_ID = "64b000000000000000000001";
const OTHER_ID = "64b000000000000000000002";

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
    User.findById.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce(null),
    });
    const { req, res } = mockReqRes({}, { userId: OTHER_ID });
    await getUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 404 (not 500) for a malformed id without querying the DB", async () => {
    const { req, res } = mockReqRes({}, { userId: "not-an-object-id" });
    await getUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("selects only public fields (no email or auth details)", async () => {
    const select = vi.fn().mockResolvedValueOnce({ _id: OTHER_ID });
    User.findById.mockReturnValueOnce({ select });
    const { req, res } = mockReqRes({}, { userId: OTHER_ID });
    await getUserProfile(req, res);
    expect(select).toHaveBeenCalledWith(PUBLIC_PROFILE_FIELDS);
    for (const secret of ["email", "authProvider", "githubId", "twoFactor"]) {
      expect(PUBLIC_PROFILE_FIELDS).not.toContain(secret);
    }
  });

  it("returns 200 with user on success", async () => {
    const mockUser = {
      _id: OTHER_ID,
      name: "Test User",
      username: "testuser",
    };
    User.findById.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce(mockUser),
    });
    const { req, res } = mockReqRes({}, { userId: OTHER_ID });
    await getUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, user: mockUser }),
    );
  });
});

// ─── getCurrentUserProfile ─────────────────────────────────────────────────
describe("getCurrentUserProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when user not found", async () => {
    User.findById.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce(null),
    });
    const { req, res } = mockReqRes({}, {}, {}, { _id: USER_ID });
    await getCurrentUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 200 with current user", async () => {
    const mockUser = { _id: USER_ID, name: "Test User" };
    User.findById.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce(mockUser),
    });
    const { req, res } = mockReqRes({}, {}, {}, { _id: USER_ID });
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
      { _id: USER_ID },
    );
    await updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates name, username, and bio and returns 200", async () => {
    const mockUser = {
      _id: USER_ID,
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
      { _id: USER_ID },
    );
    await updateProfile(req, res);
    expect(mockUser.name).toBe("New Name");
    expect(mockUser.username).toBe("newuser");
    expect(mockUser.bio).toBe("Updated bio");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updates avatar via cloudinary when avatar string is provided", async () => {
    const mockUser = {
      _id: USER_ID,
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
      { _id: USER_ID },
    );
    await updateProfile(req, res);
    expect(mockUser.avatar).toBe("https://cloudinary.com/avatar.jpg");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("uploads the new avatar before deleting the old one", async () => {
    const calls = [];
    cloudinary.uploader.upload.mockImplementationOnce(async () => {
      calls.push("upload");
      return { secure_url: "https://res.cloudinary.com/x/image/upload/v2/avatars/new.jpg" };
    });
    cloudinary.uploader.destroy.mockImplementationOnce(async (id) => {
      calls.push(`destroy:${id}`);
      return {};
    });
    const mockUser = {
      _id: USER_ID,
      username: "testuser",
      avatar: "https://res.cloudinary.com/x/image/upload/v1/avatars/old.jpg",
      save: vi.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValueOnce(mockUser);
    const { req, res } = mockReqRes(
      { avatar: "data:image/png;base64,abc123" },
      {},
      {},
      { _id: USER_ID },
    );
    await updateProfile(req, res);
    expect(calls).toEqual(["upload", "destroy:avatars/old"]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("keeps the old avatar when the upload fails", async () => {
    cloudinary.uploader.upload.mockRejectedValueOnce(new Error("boom"));
    const mockUser = {
      _id: USER_ID,
      username: "testuser",
      avatar: "https://res.cloudinary.com/x/image/upload/v1/avatars/old.jpg",
      save: vi.fn(),
    };
    User.findById.mockResolvedValueOnce(mockUser);
    const { req, res } = mockReqRes(
      { avatar: "data:image/png;base64,abc123" },
      {},
      {},
      { _id: USER_ID },
    );
    await updateProfile(req, res);
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    expect(mockUser.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("rejects an avatar that is not an image data URL", async () => {
    User.findById.mockResolvedValueOnce({ _id: USER_ID, save: vi.fn() });
    const { req, res } = mockReqRes(
      { avatar: "https://evil.example/x.svg" },
      {},
      {},
      { _id: USER_ID },
    );
    await updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
  });

  it("returns 409 when the username is taken by someone else", async () => {
    const mockUser = { _id: USER_ID, username: "me", save: vi.fn() };
    User.findById.mockResolvedValueOnce(mockUser);
    User.exists.mockResolvedValueOnce({ _id: OTHER_ID });
    const { req, res } = mockReqRes(
      { username: "Taken_Name" },
      {},
      {},
      { _id: USER_ID },
    );
    await updateProfile(req, res);
    expect(User.exists).toHaveBeenCalledWith(
      expect.objectContaining({ username: "taken_name" }),
    );
    expect(res.status).toHaveBeenCalledWith(409);
    expect(mockUser.save).not.toHaveBeenCalled();
  });

  it("rejects an invalid username format", async () => {
    User.findById.mockResolvedValueOnce({ _id: USER_ID, save: vi.fn() });
    const { req, res } = mockReqRes(
      { username: "no spaces!" },
      {},
      {},
      { _id: USER_ID },
    );
    await updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ─── updateEmail ───────────────────────────────────────────────────────────
describe("updateEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when email is missing", async () => {
    const { req, res } = mockReqRes({}, {}, {}, { _id: USER_ID });
    await updateEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when email is already in use", async () => {
    User.findOne.mockResolvedValueOnce({ _id: "other456" });
    const { req, res } = mockReqRes(
      { email: "taken@example.com" },
      {},
      {},
      { _id: USER_ID },
    );
    await updateEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 on successful email update", async () => {
    User.findOne.mockResolvedValueOnce(null);
    const mockUser = { _id: USER_ID, email: "new@example.com" };
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce(mockUser),
    });
    const { req, res } = mockReqRes(
      { email: "new@example.com" },
      {},
      {},
      { _id: USER_ID },
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
    const { req, res } = mockReqRes({}, {}, {}, { _id: USER_ID });
    await deleteProfile(req, res);
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(USER_ID);
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
      expect.objectContaining({ success: true, users: mockUsers }),
    );
  });

  it("escapes regex metacharacters in the query", async () => {
    User.find.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce([]),
    });
    const { req, res } = mockReqRes({}, {}, { query: "a.*(b" });
    await searchUsers(req, res);
    const filter = User.find.mock.calls[0][0];
    expect(filter.$or[0].username.$regex).toBe("a\\.\\*\\(b");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
