import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import config from "../server/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.VITE_SERVER_URL": JSON.stringify(config.SERVER_URL),
    "import.meta.env.VITE_WS_URL": JSON.stringify(config.WS_URL),
  },
});
