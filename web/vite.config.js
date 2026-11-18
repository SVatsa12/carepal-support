import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Unit tests cover pure utils only, so Node is enough (no DOM environment needed).
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});
