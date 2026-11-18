import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseMailbox } from "../src/lib/mailbox.js";

describe("parseMailbox", () => {
  it("splits 'Name <email>'", () => {
    assert.deepEqual(parseMailbox("CarePal Support <help@example.com>"), {
      name: "CarePal Support",
      email: "help@example.com",
    });
    assert.deepEqual(parseMailbox('"CarePal Support" <help@example.com>'), {
      name: "CarePal Support",
      email: "help@example.com",
    });
  });

  it("accepts a bare address", () => {
    assert.deepEqual(parseMailbox("  help@example.com "), { name: "", email: "help@example.com" });
  });

  it("rejects values without a valid address", () => {
    assert.equal(parseMailbox("CarePal Support"), null);
    assert.equal(parseMailbox("Name <not-an-email>"), null);
    assert.equal(parseMailbox(""), null);
  });
});
