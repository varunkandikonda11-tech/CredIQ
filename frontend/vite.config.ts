import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveApiProxyTarget(env: Record<string, string>): string {
  if (env.VITE_API_PROXY_TARGET) {
    return env.VITE_API_PROXY_TARGET;
  }
  const url = env.VITE_API_URL;
  if (url) {
    return url.replace("localhost", "127.0.0.1");
  }
  return "http://127.0.0.1:8000";
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = resolveApiProxyTarget(env);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": apiTarget,
        "/health": apiTarget,
      },
    },
  };
});
