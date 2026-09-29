import { useEffect, useState } from "react";

/**
 * Real live sync between open windows/tabs of the same browser, via
 * BroadcastChannel + a presence registry in localStorage.
 *
 * This is genuinely live — open the app in two windows side by side and
 * messages appear in both instantly. It is the same event shape a hosted
 * realtime service (Supabase Realtime) would emit, so swapping the transport
 * later touches this file only.
 */

export const tabId = Math.random().toString(36).slice(2, 8);

export interface BusMsg {
  type: "message" | "reaction";
  channel: string;
  payload: unknown;
  from: string;
}

const CHANNEL = "berean-live";
const PRESENCE_KEY = "berean:presence";

let chan: BroadcastChannel | null = null;
function bus(): BroadcastChannel | null {
  if (chan) return chan;
  if (typeof BroadcastChannel === "undefined") return null;
  try {
    chan = new BroadcastChannel(CHANNEL);
    return chan;
  } catch {
    return null;
  }
}

export function broadcast(msg: BusMsg) {
  try {
    bus()?.postMessage(msg);
  } catch {
    /* peer may have closed */
  }
}

export function subscribeBus(fn: (m: BusMsg) => void): () => void {
  const b = bus();
  if (!b) return () => undefined;
  const handler = (e: MessageEvent) => fn(e.data as BusMsg);
  b.addEventListener("message", handler);
  return () => b.removeEventListener("message", handler);
}

function readPresence(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(PRESENCE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writePresence(reg: Record<string, number>) {
  try {
    localStorage.setItem(PRESENCE_KEY, JSON.stringify(reg));
  } catch {
    /* ignore */
  }
}

/** Number of live windows of this app on this device. */
export function usePresence(): number {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const tick = () => {
      const reg = readPresence();
      const now = Date.now();
      for (const [id, t] of Object.entries(reg)) if (now - t > 12000) delete reg[id];
      reg[tabId] = now;
      writePresence(reg);
      setCount(Object.keys(reg).length);
    };
    tick();
    const interval = window.setInterval(tick, 4000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === PRESENCE_KEY) tick();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", onStorage);
      const reg = readPresence();
      delete reg[tabId];
      writePresence(reg);
    };
  }, []);

  return count;
}
