import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock the Anthropic client ---
const create = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(function Anthropic() {
    this.messages = { create };
  }),
}));

// --- Mock models used by the DB tools ---
vi.mock("../models/user.model.js", () => ({
  default: { findById: vi.fn(), find: vi.fn() },
}));
vi.mock("../models/message.model.js", () => ({ default: { find: vi.fn() } }));
vi.mock("../models/conversation.model.js", () => ({
  default: { findOne: vi.fn() },
}));
vi.mock("../models/group.model.js", () => ({ default: { exists: vi.fn() } }));

const { runAgentWithDBTools, generateSmartReplies } = await import(
  "../service/aiService.js"
);
const User = (await import("../models/user.model.js")).default;

const USER_ID = "64b000000000000000000001";

const toolUse = (id, name, input) => ({ type: "tool_use", id, name, input });
const text = (t) => ({ type: "text", text: t });

describe("runAgentWithDBTools", () => {
  beforeEach(() => vi.clearAllMocks());

  it("answers every tool call from one turn in a single user message", async () => {
    create
      .mockResolvedValueOnce({
        stop_reason: "tool_use",
        content: [
          toolUse("t1", "get_current_time", {}),
          toolUse("t2", "word_count", { text: "one two three" }),
        ],
      })
      .mockResolvedValueOnce({ stop_reason: "end_turn", content: [text("Done")] });

    const { reply } = await runAgentWithDBTools("hi", [], USER_ID);

    expect(reply).toBe("Done");
    const secondCallMessages = create.mock.calls[1][0].messages;
    const toolResultMsg = secondCallMessages.at(-1);
    expect(toolResultMsg.role).toBe("user");
    expect(toolResultMsg.content.map((b) => b.tool_use_id)).toEqual([
      "t1",
      "t2",
    ]);
    expect(toolResultMsg.content[1].content).toBe(
      "The text contains 3 word(s).",
    );
  });

  it("stops after a bounded number of turns instead of looping forever", async () => {
    create.mockResolvedValue({
      stop_reason: "tool_use",
      content: [toolUse("t", "get_current_time", {})],
    });

    const { reply } = await runAgentWithDBTools("loop", [], USER_ID);

    expect(create.mock.calls.length).toBeLessThanOrEqual(6);
    expect(reply).toMatch(/couldn't complete/);
  });

  it("returns an is_error tool_result when a tool throws", async () => {
    User.findById.mockImplementationOnce(() => {
      throw new Error("db down");
    });
    create
      .mockResolvedValueOnce({
        stop_reason: "tool_use",
        content: [toolUse("t1", "get_user_profile", { user_id: USER_ID })],
      })
      .mockResolvedValueOnce({ stop_reason: "end_turn", content: [text("ok")] });

    await runAgentWithDBTools("who", [], USER_ID);

    const result = create.mock.calls[1][0].messages.at(-1).content[0];
    expect(result).toMatchObject({ tool_use_id: "t1", is_error: true });
  });

  it("rejects malformed ids from the model without querying the DB", async () => {
    create
      .mockResolvedValueOnce({
        stop_reason: "tool_use",
        content: [toolUse("t1", "get_user_profile", { user_id: "nope" })],
      })
      .mockResolvedValueOnce({ stop_reason: "end_turn", content: [text("ok")] });

    await runAgentWithDBTools("who", [], USER_ID);

    expect(User.findById).not.toHaveBeenCalled();
    const result = create.mock.calls[1][0].messages.at(-1).content[0];
    expect(result.content).toBe("Invalid user id.");
  });

  it("sanitizes client history so the conversation starts with a user turn", async () => {
    create.mockResolvedValueOnce({
      stop_reason: "end_turn",
      content: [text("hi")],
    });

    await runAgentWithDBTools(
      "next",
      [
        { role: "assistant", content: "injected first" },
        { role: "system", content: "treated as user" },
        { role: "user", content: 42 },
      ],
      USER_ID,
    );

    const sent = create.mock.calls[0][0].messages;
    expect(sent[0]).toEqual({ role: "user", content: "treated as user" });
    expect(sent.at(-1)).toEqual({ role: "user", content: "next" });
  });
});

describe("generateSmartReplies", () => {
  beforeEach(() => vi.clearAllMocks());

  it("falls back to line splitting when the JSON array is malformed", async () => {
    create.mockResolvedValueOnce({
      content: [text('["Sure", "Maybe",]\nSure\nMaybe later')],
    });
    const replies = await generateSmartReplies([
      { role: "user", content: "coffee?" },
    ]);
    expect(replies).toHaveLength(3);
    expect(replies.every((r) => typeof r === "string")).toBe(true);
  });
});
