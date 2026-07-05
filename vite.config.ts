import path from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE_PATH || "/";

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "script",
        manifest: {
          name: "MYDEA",
          short_name: "MYDEA",
          description: "아이디어를 검증 가능한 7일 실행안으로 바꾸는 도구",
          lang: "ko",
          theme_color: "#f4f1ea",
          background_color: "#f4f1ea",
          display: "standalone",
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}pwa-192.svg`,
              sizes: "192x192",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: `${base}pwa-512.svg`,
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "any",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: true,
    },
  };
});
