import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths: the same build works at a domain root, in a sub-folder,
  // and inside a Capacitor shell later.
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // The app updates itself on the next visit; nobody is asked to reload mid-chapter.
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Berean",
        short_name: "Berean",
        description: "The Bible, in seasons. Read one short episode at a time.",
        lang: "en",
        display: "standalone",
        orientation: "portrait",
        background_color: "#11110f",
        theme_color: "#11110f",
        start_url: "./",
        scope: "./",
        categories: ["books", "lifestyle", "education"],
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Code, styles, fonts and the shell are stored on first visit, so the app opens offline.
        globPatterns: ["**/*.{js,css,html,woff2,svg}", "icons/*.png"],
        navigateFallback: "index.html",
        // Season posters are 200-300 KB each: keep them after first view instead of downloading all up front.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/images/"),
            handler: "CacheFirst",
            options: {
              cacheName: "berean-images",
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
        ],
      },
    }),
  ],
  // Lets the hosted preview (a different hostname) reach the dev server.
  server: { host: true, allowedHosts: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
