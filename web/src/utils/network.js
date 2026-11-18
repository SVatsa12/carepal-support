/** Resolves immediately when online, otherwise on the next "online" event. */
export function waitUntilOnline() {
  if (navigator.onLine) return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("online", () => resolve(), { once: true });
  });
}
