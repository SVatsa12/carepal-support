import { describe, expect, it } from "vitest";
import { quickReplyCategoryLabel, rankQuickReplies, validateQuickReply } from "./quickReplies";

const REPLIES = [
  { id: "1", title: "Nurse running late", category: "late_nurse", body: "On the way" },
  { id: "2", title: "Need more details", category: "any", body: "Share the caregiver name" },
  { id: "3", title: "Invoice under review", category: "billing", body: "Billing team" },
  { id: "4", title: "Closing the ticket", category: "any", body: "Marking as resolved" },
  { id: "5", title: "Caregiver replaced", category: "late_nurse", body: "New caregiver" },
];
const ids = (list) => list.map((reply) => reply.id);

describe("rankQuickReplies", () => {
  it("lists the ticket's category first, then 'any', each A–Z, and hides other categories", () => {
    expect(ids(rankQuickReplies(REPLIES, "late_nurse"))).toEqual(["5", "1", "4", "2"]);
    expect(ids(rankQuickReplies(REPLIES, "billing"))).toEqual(["3", "4", "2"]);
  });

  it("searches title and body case-insensitively, title matches first within a group", () => {
    expect(ids(rankQuickReplies(REPLIES, "late_nurse", "CAREGIVER"))).toEqual(["5", "2"]);
    expect(ids(rankQuickReplies(REPLIES, "late_nurse", "  late "))).toEqual(["1"]);
    expect(rankQuickReplies(REPLIES, "late_nurse", "zzz")).toEqual([]);
  });
});

describe("validateQuickReply", () => {
  it("accepts a valid reply", () => {
    expect(
      validateQuickReply({ title: "Hello", body: "Hi {{memberName}}", category: "any" }),
    ).toEqual({});
  });

  it("checks trimmed lengths and the category", () => {
    const errors = validateQuickReply({ title: "  Hi ", body: "x".repeat(1001), category: "food" });
    expect(Object.keys(errors).sort()).toEqual(["body", "category", "title"]);
    expect(
      validateQuickReply({ title: "a".repeat(61), body: "Fine body", category: "billing" }),
    ).toHaveProperty("title");
    expect(
      validateQuickReply({ title: "Okay", body: " abc  ", category: "billing" }),
    ).toHaveProperty("body");
  });
});

describe("quickReplyCategoryLabel", () => {
  it("labels 'any' and real categories", () => {
    expect(quickReplyCategoryLabel("any")).toBe("Any category");
    expect(quickReplyCategoryLabel("billing")).toBe("Billing & invoices");
  });
});
