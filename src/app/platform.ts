/**
 * Where is Berean running? Store rules differ by platform, and a few screens
 * (mainly giving) must behave differently.
 *
 * We read Capacitor's global instead of importing it so the web build stays
 * free of native code. Capacitor injects `window.Capacitor` inside the app.
 */
export type Platform = "ios" | "android" | "web";

interface CapacitorGlobal {
  getPlatform?: () => string;
  isNativePlatform?: () => boolean;
}

export function platform(): Platform {
  const cap = (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor;
  const p = cap?.getPlatform?.();
  return p === "ios" || p === "android" ? p : "web";
}

export const isNative = () => platform() !== "web";
