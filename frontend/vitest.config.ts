import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["testSetup.ts", "vitest-localstorage-mock"],
    include: ["src/tests/*.test.{ts,tsx}"],
    coverage: {
      exclude: ["src/__generated__/**"],
    },
  },
});
