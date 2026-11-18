/** Shortens `text` to at most `max` characters, ending with "…" when cut. */
export function truncate(text, max) {
  const value = text ?? "";
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Replaces {{name}} placeholders with values from `vars`.
 * Unknown or empty placeholders are left as-is so the agent notices them before sending.
 */
export function fillTemplate(body, vars) {
  return (body ?? "").replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = vars?.[key];
    return value == null || value === "" ? match : String(value);
  });
}

export function firstName(fullName) {
  return (fullName ?? "").trim().split(/\s+/)[0] ?? "";
}
