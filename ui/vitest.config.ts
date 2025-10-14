import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["testSetup.ts", "vitest-localstorage-mock"],
    include: ["src/tests/*.test.{ts,tsx}"],
  },
});
