import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

// Env the app reads while its modules load
process.env.JWT_SECRET = "test_secret";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
process.env.GITHUB_CLIENT_ID = "test_client";
process.env.GITHUB_CLIENT_SECRET = "test_secret";
process.env.ANTHROPIC_API_KEY = "test_key";
process.env.CLIENT_URL = "http://localhost:5173";

const USER_ID = "64b000000000000000000001";

// `protect` looks the user up; no database in these tests
vi.mock("../models/user.model.js", () => ({
  default: {
    findById: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ _id: USER_ID, name: "Test" }),
    })),
  },
}));

const { createApp } = await import("../app.js");
const { signAccessToken } = await import("../service/token.service.js");

let server;
let base;

beforeAll(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

const post = (path, body, headers = {}) =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("HTTP app", () => {
  it("returns JSON 404 for unknown routes", async () => {
    const res = await fetch(`${base}/api/does-not-exist`);
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ success: false });
  });

  it("returns 400 JSON for a malformed JSON body", async () => {
    const res = await post("/api/auth/login", "{not json");
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ message: "Malformed JSON body" });
  });

  it("returns 413 for bodies over the size limit", async () => {
    const res = await post("/api/auth/login", { blob: "x".repeat(9 * 1024 * 1024) });
    expect(res.status).toBe(413);
  });

  it("sends security headers", async () => {
    const res = await fetch(`${base}/`);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("requires login for the user directory", async () => {
    const res = await fetch(`${base}/api/profile/all`);
    expect(res.status).toBe(401);
  });

  it("validates AI chat input before calling the model", async () => {
    const token = signAccessToken(USER_ID);
    const res = await post(
      "/api/ai/chat",
      { message: "   " },
      { Authorization: `Bearer ${token}` },
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/^message:/);
  });

  it("rejects oversized AI input", async () => {
    const token = signAccessToken(USER_ID);
    const res = await post(
      "/api/ai/sentiment",
      { text: "a".repeat(5001) },
      { Authorization: `Bearer ${token}` },
    );
    expect(res.status).toBe(400);
  });
});
