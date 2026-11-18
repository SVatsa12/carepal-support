import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  conversationPath,
  isFresh,
  isThrottled,
  otherSide,
  senderSide,
} from "../src/lib/policy.js";

const ticket = { memberId: "member-1" };

describe("senderSide", () => {
  it("lets staff notify on any ticket and members only on their own", () => {
    assert.equal(senderSide("agent-1", { role: "agent" }, ticket), "staff");
    assert.equal(senderSide("admin-1", { role: "admin" }, ticket), "staff");
    assert.equal(senderSide("member-1", { role: "member" }, ticket), "member");
    assert.equal(senderSide("member-2", { role: "member" }, ticket), null);
    assert.equal(senderSide("ghost", undefined, ticket), null);
  });

  it("maps each side to the other", () => {
    assert.equal(otherSide("member"), "staff");
    assert.equal(otherSide("staff"), "member");
  });
});

describe("isFresh", () => {
  const now = 1_000_000_000;
  it("accepts messages up to two minutes old", () => {
    assert.equal(isFresh(now - 5_000, now), true);
    assert.equal(isFresh(now - 120_000, now), true);
    assert.equal(isFresh(now - 120_001, now), false);
  });

  it("tolerates small clock skew but not missing times", () => {
    assert.equal(isFresh(now + 10_000, now), true);
    assert.equal(isFresh(now + 60_000, now), false);
    assert.equal(isFresh(NaN, now), false);
  });
});

describe("isThrottled", () => {
  const now = 1_000_000_000;
  it("throttles inside the window only", () => {
    assert.equal(isThrottled(now - 9 * 60_000, now, 10), true);
    assert.equal(isThrottled(now - 10 * 60_000, now, 10), false);
    assert.equal(isThrottled(NaN, now, 10), false);
    assert.equal(isThrottled(now, now, 0), false);
  });
});

describe("conversationPath", () => {
  it("links each side to its own app", () => {
    assert.equal(conversationPath("member", "abc"), "/app/tickets/abc");
    assert.equal(conversationPath("staff", "abc"), "/admin/inbox/abc");
  });
});
