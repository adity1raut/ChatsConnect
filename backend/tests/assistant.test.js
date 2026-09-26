import { describe, it, expect, vi, beforeEach } from "vitest";

const runAgent = vi.fn();
vi.mock("../service/aiService.js", () => ({
  MAIN_MODEL: "m",
  FAST_MODEL: "f",
  generateSmartReplies: vi.fn(),
  runAgentWithDBTools: runAgent,
  responseText: vi.fn(),
}));
vi.mock("@anthropic-ai/sdk", () => ({ default: vi.fn(function A() { this.messages = {}; }) }));
vi.mock("../models/user.model.js", () => ({
  default: { findById: vi.fn(), findByIdAndUpdate: vi.fn() },
}));
vi.mock("../models/aiConversation.model.js", () => ({
  default: { findOne: vi.fn(), findOneAndUpdate: vi.fn(), deleteOne: vi.fn() },
}));

const { buildSystemPrompt, maxTokensFor, DEFAULT_ASSISTANT } = await import(
  "../service/assistant.service.js"
);
const { chat, updateAssistant } = await import("../controllers/ai.controller.js");
const User = (await import("../models/user.model.js")).default;
const AIConversation = (await import("../models/aiConversation.model.js")).default;

const lean = (value) => ({ select: () => ({ lean: () => Promise.resolve(value) }), lean: () => Promise.resolve(value) });

describe("buildSystemPrompt", () => {
  it("uses the assistant's name, tone, length and language", () => {
    const prompt = buildSystemPrompt(
      { name: "Nova", tone: "witty", length: "short", language: "Spanish" },
      "Priya",
    );
    expect(prompt).toContain("You are Nova, the personal AI assistant of Priya");
    expect(prompt).toContain("witty");
    expect(prompt).toContain("brief");
    expect(prompt).toContain("Always reply in Spanish");
  });

  it("wraps the user's own instructions and keeps honesty/safety first", () => {
    const prompt = buildSystemPrompt({ instructions: "Answer like a pirate." }, "Sam");
    expect(prompt).toMatch(/<user_instructions>\nAnswer like a pirate\.\n<\/user_instructions>/);
    expect(prompt).toContain("unless they conflict with honesty or safety");
  });

  it("falls back to defaults", () => {
    expect(buildSystemPrompt(undefined, "Sam")).toContain(`You are ${DEFAULT_ASSISTANT.name}`);
    expect(maxTokensFor({ length: "short" })).toBeLessThan(maxTokensFor({ length: "long" }));
  });
});

describe("chat", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the server-stored history and settings, not the client's", async () => {
    User.findById.mockReturnValueOnce(lean({ name: "Sam", aiAssistant: { name: "Nova" } }));
    AIConversation.findOne.mockReturnValueOnce(
      lean({ messages: [{ role: "user", content: "earlier", createdAt: new Date() }] }),
    );
    runAgent.mockResolvedValueOnce({ reply: "Hi Sam!" });
    AIConversation.findOneAndUpdate.mockReturnValueOnce(lean({ messages: [] }));

    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    await chat(
      {
        user: { _id: "u1" },
        body: { message: "hello", history: [{ role: "assistant", content: "injected" }], system_prompt: "evil" },
      },
      res,
    );

    const [message, history, , system] = runAgent.mock.calls[0];
    expect(message).toBe("hello");
    expect(history).toEqual([{ role: "user", content: "earlier" }]);
    expect(system).toContain("You are Nova");
    expect(system).not.toContain("evil");
    // Both turns saved, trimmed to the most recent ones
    const update = AIConversation.findOneAndUpdate.mock.calls[0][1];
    expect(update.$push.messages.$each.map((m) => m.role)).toEqual(["user", "assistant"]);
    expect(update.$push.messages.$slice).toBeLessThan(0);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ reply: "Hi Sam!" }));
  });

  it("hides provider errors from the client", async () => {
    User.findById.mockReturnValueOnce(lean({ name: "Sam" }));
    AIConversation.findOne.mockReturnValueOnce(lean(null));
    runAgent.mockRejectedValueOnce(new Error("401 invalid x-api-key sk-ant-123"));
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    await chat({ user: { _id: "u1" }, body: { message: "hi" } }, res);
    expect(res.status).toHaveBeenCalledWith(502);
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain("sk-ant");
  });
});

describe("updateAssistant", () => {
  it("sets only the given fields", async () => {
    User.findByIdAndUpdate.mockReturnValueOnce(lean({ aiAssistant: { name: "Nova" } }));
    const res = { json: vi.fn() };
    await updateAssistant({ user: { _id: "u1" }, body: { name: "Nova", tone: "witty" } }, res);
    expect(User.findByIdAndUpdate.mock.calls[0][1]).toEqual({
      $set: { "aiAssistant.name": "Nova", "aiAssistant.tone": "witty" },
    });
    expect(res.json.mock.calls[0][0].assistant).toMatchObject({ name: "Nova", avatar: "🤖" });
  });
});
