import { describe, expect, it } from "vitest";
import { fillTemplate, firstName, truncate } from "./text";

describe("truncate", () => {
  it("leaves short text alone", () => {
    expect(truncate("Nurse arrived late", 120)).toBe("Nurse arrived late");
  });

  it("keeps text that is exactly the limit", () => {
    expect(truncate("abcde", 5)).toBe("abcde");
  });

  it("cuts long text to the limit, ending with an ellipsis", () => {
    const result = truncate("The nurse did not arrive for the morning visit", 20);
    expect(result).toBe("The nurse did not a…");
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("treats null and undefined as empty", () => {
    expect(truncate(null, 10)).toBe("");
    expect(truncate(undefined, 10)).toBe("");
  });
});

describe("fillTemplate", () => {
  const vars = { memberName: "Priya", ticketNo: "TCP-ABC123", agentName: "Rohit" };

  it("replaces every known placeholder", () => {
    expect(fillTemplate("Hi {{memberName}}, {{agentName}} here about {{ticketNo}}.", vars)).toBe(
      "Hi Priya, Rohit here about TCP-ABC123.",
    );
  });

  it("allows spaces inside the braces and repeated placeholders", () => {
    expect(fillTemplate("{{ memberName }} / {{memberName}}", vars)).toBe("Priya / Priya");
  });

  it("leaves unknown or empty placeholders visible so the agent notices", () => {
    expect(fillTemplate("Hi {{nickname}}", vars)).toBe("Hi {{nickname}}");
    expect(fillTemplate("Hi {{memberName}}", { memberName: "" })).toBe("Hi {{memberName}}");
  });

  it("handles a missing body or vars", () => {
    expect(fillTemplate(null, vars)).toBe("");
    expect(fillTemplate("Hi {{memberName}}", undefined)).toBe("Hi {{memberName}}");
  });
});

describe("firstName", () => {
  it("returns the first word of a name", () => {
    expect(firstName("  Meera Iyer ")).toBe("Meera");
    expect(firstName(null)).toBe("");
  });
});
