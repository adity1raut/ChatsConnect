import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dayLabel, groupByDay, previewText, toViewMessage } from "./messages.js";
import { buildChatMarkdown } from "./chatMarkdown.js";

const ME = "u-me";
const at = (iso) => new Date(iso).toISOString();

describe("toViewMessage", () => {
  it("marks my own messages", () => {
    const m = toViewMessage(
      { _id: "1", senderId: { _id: ME, name: "Me" }, content: "hi", createdAt: at("2026-09-01T10:00:00Z") },
      ME,
    );
    assert.equal(m.mine, true);
    assert.equal(m.text, "hi");
  });

  it("survives messages from deleted accounts", () => {
    const m = toViewMessage({ _id: "2", senderId: null, content: "old", createdAt: at("2026-09-01T10:00:00Z") }, ME);
    assert.equal(m.mine, false);
    assert.equal(m.senderName, "Deleted account");
  });
});

describe("groupByDay", () => {
  const msg = (id, senderId, iso) => ({ id, senderId, createdAt: at(iso) });

  it("splits by day and marks quick follow-ups from the same sender", () => {
    const sections = groupByDay([
      msg("a", "x", "2026-09-01T10:00:00Z"),
      msg("b", "x", "2026-09-01T10:02:00Z"), // same sender, 2 min later
      msg("c", "y", "2026-09-01T10:03:00Z"), // different sender
      msg("d", "y", "2026-09-01T10:30:00Z"), // same sender, 27 min later
      msg("e", "y", "2026-09-02T09:00:00Z"), // next day
    ]);
    assert.equal(sections.length, 2);
    assert.deepEqual(
      sections[0].items.map((m) => m.continued),
      [false, true, false, false],
    );
    assert.equal(sections[1].items[0].continued, false);
  });
});

describe("dayLabel", () => {
  const now = new Date("2026-09-26T12:00:00");
  it("uses Today / Yesterday, then dates", () => {
    assert.equal(dayLabel(new Date("2026-09-26T08:00:00"), now), "Today");
    assert.equal(dayLabel(new Date("2026-09-25T23:59:00"), now), "Yesterday");
    assert.match(dayLabel(new Date("2026-09-20T08:00:00"), now), /September/);
  });
});

describe("previewText", () => {
  it("strips markdown and collapses code blocks", () => {
    assert.equal(previewText("**Hi** _there_\n```js\nx()\n```"), "Hi there [code]");
  });
});

describe("buildChatMarkdown", () => {
  it("writes a titled, dated document that keeps each message's markdown", () => {
    const md = buildChatMarkdown(
      { type: "user", name: "Alice Park" },
      [
        { senderName: "Alice Park", text: "Hello **there**", createdAt: at("2026-09-26T09:00:00Z") },
        { senderName: "Me", text: "- one\n- two", createdAt: at("2026-09-26T09:05:00Z") },
      ],
      new Date("2026-09-26T12:00:00Z"),
    );
    assert.match(md, /^# Chat with Alice Park/);
    assert.match(md, /2 messages/);
    assert.match(md, /## Today/);
    assert.match(md, /\*\*Alice Park\*\* · .+\n\nHello \*\*there\*\*/);
    assert.match(md, /- one\n- two/);
  });
});
