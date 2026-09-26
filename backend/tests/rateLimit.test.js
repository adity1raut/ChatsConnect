import { describe, it, expect } from "vitest";
import express from "express";
import { clientIp, createLimiter } from "../middleware/rateLimit.js";

describe("clientIp", () => {
  it("strips the port Azure adds to X-Forwarded-For", () => {
    expect(clientIp({ ip: "203.0.113.7:51234" })).toBe("203.0.113.7");
    expect(clientIp({ ip: "[2001:db8::1]:443" })).toBe("2001:db8::1");
  });

  it("leaves plain addresses alone", () => {
    expect(clientIp({ ip: "203.0.113.7" })).toBe("203.0.113.7");
    expect(clientIp({ ip: "2001:db8::1" })).toBe("2001:db8::1");
  });
});

describe("rate limiting behind Azure's proxy", () => {
  it("counts one client across connections with different source ports", async () => {
    const app = express();
    app.set("trust proxy", 1);
    app.get("/", createLimiter({ windowMs: 60_000, limit: 2, message: "slow down" }), (req, res) =>
      res.json({ ok: true }),
    );
    const server = app.listen(0);
    await new Promise((r) => server.once("listening", r));
    const url = `http://127.0.0.1:${server.address().port}/`;

    const statuses = [];
    for (const port of [50001, 50002, 50003]) {
      const res = await fetch(url, { headers: { "x-forwarded-for": `198.51.100.9:${port}` } });
      statuses.push(res.status);
    }
    const other = await fetch(url, { headers: { "x-forwarded-for": "198.51.100.10:50004" } });
    server.close();

    expect(statuses).toEqual([200, 200, 429]);
    expect(other.status).toBe(200);
  });
});
