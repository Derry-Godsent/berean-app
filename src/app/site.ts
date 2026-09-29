/**
 * The public address of this app, used in links people share (WhatsApp etc).
 * Set VITE_SITE_URL once you own a domain; until then it is wherever the app is running.
 */
export function siteUrl(): string {
  const configured = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SITE_URL ?? "").trim();
  if (configured) return configured.replace(/\/$/, "");
  return typeof window !== "undefined" ? window.location.origin : "";
}
