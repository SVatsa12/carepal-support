const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Keeps Tab / Shift+Tab inside `container` (for dialogs and sheets). Call from a keydown
 * handler; it does nothing for other keys.
 */
export function trapTabKey(event, container) {
  if (event.key !== "Tab" || !container) return;
  const items = [...container.querySelectorAll(FOCUSABLE)].filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  );
  if (items.length === 0) {
    event.preventDefault();
    return;
  }
  const first = items[0];
  const last = items.at(-1);
  const inside = container.contains(document.activeElement);
  if (event.shiftKey && (document.activeElement === first || !inside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
    event.preventDefault();
    first.focus();
  }
}
