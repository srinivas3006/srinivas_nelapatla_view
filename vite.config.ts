import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// Server output format: Netlify builds set NETLIFY=true; otherwise keep the
// Vercel output the existing deployment uses. NITRO_PRESET overrides both.
const nitroPreset = process.env.NITRO_PRESET ?? (process.env.NETLIFY ? "netlify" : "vercel");

export default defineConfig({
  plugins: [
    nitro({ preset: nitroPreset }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: {
        entry: "server",
      },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    exclude: ["vinxi/http"],
  },
  server: {
    watch: {
      ignored: ["**/*.pdf", "**/srinivas_nelapatla.pdf"],
    },
  },
});
