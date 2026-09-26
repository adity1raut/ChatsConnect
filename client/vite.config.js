import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    // "@/components/ui/button" — the alias shadcn/ui components are written against
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Framework and realtime code change rarely: separate chunks stay cached across deploys
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return "react";
          if (/node_modules\/(socket\.io-client|socket\.io-parser|engine\.io-client|engine\.io-parser|@socket\.io)\//.test(id)) return "socket";
          return undefined;
        },
      },
    },
  },
});
