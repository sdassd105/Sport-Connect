import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const plugins = [react(), tailwindcss(), vitePluginManusRuntime()];

export default defineConfig(({ mode }) => {
  // Load `.env*` so the proxy can follow VITE_API_URL in dev (useful if you
  // only run the Vite dev server and want to hit the deployed API).
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "");
  const configuredBaseUrl = (env.VITE_API_URL || "").replace(/\/$/, "");

  const proxyTarget = configuredBaseUrl || "http://127.0.0.1:3001";

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      strictPort: false, // Will find next available port if 3000 is busy
      host: true,
      proxy: {
        "/api": {
          // Use IPv4 to avoid localhost resolving to ::1 on some machines (ECONNREFUSED).
          // If VITE_API_URL is set (e.g. Railway), proxy to it so CORS is avoided.
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
      allowedHosts: [
        ".manuspre.computer",
        ".manus.computer",
        ".manus-asia.computer",
        ".manuscomputer.ai",
        ".manusvm.computer",
        "localhost",
        "127.0.0.1",
      ],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
