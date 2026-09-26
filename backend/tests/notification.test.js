import { describe, it, expect, vi, beforeEach } from "vitest";

const emit = vi.fn();
const fetchSockets = vi.fn().mockResolvedValue([]);
vi.mock("../socket/io.js", () => ({
  getIO: () => ({
    to: () => ({ emit }),
    in: () => ({ fetchSockets }),
  }),
}));

const populated = (doc) => ({
  ...doc,
  populate: vi.fn().mockResolvedValue(undefined),
  toObject: () => doc,
});

vi.mock("../models/notification.model.js", () => ({
  default: {
    create: vi.fn(async (doc) => populated(doc)),
    findOneAndUpdate: vi.fn(async (filter, update) =>
      populated({ ...filter, ...update.$set, count: 1 }),
    ),
    deleteMany: vi.fn().mockResolvedValue({}),
    updateMany: vi.fn().mockResolvedValue({}),
    countDocuments: vi.fn().mockResolvedValue(3),
    find: vi.fn(),
  },
}));

vi.mock("../models/user.model.js", () => ({
  default: {
    findById: vi.fn(() => ({
      select: () => ({ lean: () => Promise.resolve({ notificationPrefs: {} }) }),
    })),
  },
}));

const { notify } = await import("../service/notification.service.js");
const { markRead } = await import("../controllers/notification.controller.js");
const Notification = (await import("../models/notification.model.js")).default;
const User = (await import("../models/user.model.js")).default;

const ALICE = "64b000000000000000000001";
const BOB = "64b000000000000000000002";
const CONV = "64b0000000000000000000c1";

const prefs = (notificationPrefs) =>
  User.findById.mockReturnValueOnce({
    select: () => ({ lean: () => Promise.resolve({ notificationPrefs }) }),
  });

describe("notify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSockets.mockResolvedValue([]);
  });

  it("collapses DM notifications into the chat's unread notification", async () => {
    await notify({
      recipient: BOB,
      type: "message",
      actor: ALICE,
      conversationId: CONV,
      body: "hi",
    });
    expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
      { recipient: BOB, groupKey: `dm:${CONV}`, read: false },
      expect.objectContaining({ $inc: { count: 1 } }),
      expect.objectContaining({ upsert: true }),
    );
    expect(emit).toHaveBeenCalledWith("notification:new", expect.any(Object));
  });

  it("skips message notifications while the recipient is viewing that chat", async () => {
    fetchSockets.mockResolvedValueOnce([{ data: { activeChat: `peer:${ALICE}` } }]);
    const result = await notify({
      recipient: BOB,
      type: "message",
      actor: ALICE,
      conversationId: CONV,
      body: "hi",
    });
    expect(result).toBeNull();
    expect(Notification.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("respects the recipient's preferences", async () => {
    prefs({ friendRequests: false });
    const result = await notify({ recipient: BOB, type: "friend_request", actor: ALICE });
    expect(result).toBeNull();
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("never notifies people about their own actions", async () => {
    expect(await notify({ recipient: ALICE, type: "friend_request", actor: ALICE })).toBeNull();
  });

  it("creates a separate notification for non-message events", async () => {
    await notify({ recipient: BOB, type: "missed_call", actor: ALICE, meta: { callType: "video" } });
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "missed_call", count: 1 }),
    );
  });

  it("truncates previews", async () => {
    await notify({
      recipient: BOB,
      type: "message",
      actor: ALICE,
      conversationId: CONV,
      body: "x".repeat(500),
    });
    const update = Notification.findOneAndUpdate.mock.calls[0][1];
    expect(update.$set.body).toHaveLength(140);
  });
});

describe("markRead", () => {
  beforeEach(() => vi.clearAllMocks());

  const run = (body) => {
    const res = { json: vi.fn() };
    return markRead({ body, user: { _id: BOB } }, res).then(() => res);
  };

  it("clears a chat's message notifications when it is opened", async () => {
    const res = await run({ conversationId: CONV });
    expect(Notification.deleteMany).toHaveBeenCalledWith({
      recipient: BOB,
      groupKey: `dm:${CONV}`,
    });
    expect(res.json).toHaveBeenCalledWith({ unreadCount: 3 });
  });

  it("marks only the given ids, scoped to the current user", async () => {
    await run({ ids: [CONV] });
    expect(Notification.updateMany).toHaveBeenCalledWith(
      { recipient: BOB, read: false, _id: { $in: [CONV] } },
      expect.objectContaining({ read: true }),
    );
  });

  it("syncs the user's other tabs", async () => {
    await run({ all: true });
    expect(emit).toHaveBeenCalledWith(
      "notifications:read",
      expect.objectContaining({ all: true, unreadCount: 3 }),
    );
  });
});
