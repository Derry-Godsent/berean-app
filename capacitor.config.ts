import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Wraps the Vite build (dist/) as a native Android/iOS app.
 * See docs/04-MOBILE-LAUNCH.md for the full store checklist.
 *
 * ⚠ DECIDE BEFORE YOU FIRST PUBLISH: `appId` is permanent on both stores.
 * Use a reverse-domain you control (e.g. "app.yourdomain.berean").
 * The value below is a placeholder.
 */
const config: CapacitorConfig = {
  appId: "app.berean.bible",
  appName: "Berean",
  webDir: "dist",
  backgroundColor: "#11110f",
  android: { allowMixedContent: false },
  ios: { contentInset: "always" },
  plugins: {
    SplashScreen: { launchAutoHide: true, backgroundColor: "#11110f" },
  },
};

export default config;
