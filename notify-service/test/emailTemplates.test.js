import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildReplyEmail, escapeHtml, snippet } from "../src/lib/emailTemplates.js";

const input = {
  ticketNo: "TCP-AB12CD",
  ticketSubject: "Nurse\nlate today",
  senderName: "Meera · CarePal team",
  recipientName: "Priya",
  text: "Hello <b>Priya</b> & family",
  link: "http://localhost:5173/app/tickets/ab12cd",
};

describe("buildReplyEmail", () => {
  it("builds a single-line subject", () => {
    assert.equal(buildReplyEmail(input).subject, "New reply on TCP-AB12CD: Nurse late today");
  });

  it("escapes the message in HTML but keeps it readable in text", () => {
    const email = buildReplyEmail(input);
    assert.ok(email.html.includes("Hello &lt;b&gt;Priya&lt;/b&gt; &amp; family"));
    assert.ok(!email.html.includes("<b>Priya</b>"));
    assert.ok(email.text.includes("Hello <b>Priya</b> & family"));
    assert.ok(email.html.includes(`href="${input.link}"`));
    assert.ok(email.text.includes(`Open conversation: ${input.link}`));
  });
});

describe("snippet", () => {
  it("keeps the first 300 characters and adds an ellipsis", () => {
    assert.equal(snippet("x".repeat(300)), "x".repeat(300));
    assert.equal(snippet("x".repeat(301)), `${"x".repeat(300)}…`);
  });

  it("never splits an emoji", () => {
    assert.equal(snippet("ab😀cd", 3), "ab😀…");
  });
});

describe("escapeHtml", () => {
  it("escapes quotes too", () => {
    assert.equal(escapeHtml(`"a" 'b'`), "&quot;a&quot; &#39;b&#39;");
  });
});
