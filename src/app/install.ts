import { useCallback, useEffect, useState } from "react";
import { isNative } from "./platform";

/**
 * "Add to home screen" support.
 *  - Android / desktop Chrome and Edge fire `beforeinstallprompt`; we keep the event and
 *    show our own button.
 *  - iPhone / iPad Safari never fires it: the only way is Share -> Add to Home Screen,
 *    so we show those steps instead.
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "berean:install:dismissed";

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // Other iOS browsers (Chrome, Firefox) cannot add to home screen the same way.
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return ios && safari;
}

export type InstallState =
  | { kind: "hidden" }
  | { kind: "prompt"; install: () => Promise<void>; dismiss: () => void }
  | { kind: "ios"; dismiss: () => void };

export function useInstall(): InstallState {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const install = useCallback(async () => {
    if (!event) return;
    await event.prompt();
    const { outcome } = await event.userChoice;
    setEvent(null);
    if (outcome === "dismissed") dismiss();
  }, [event, dismiss]);

  if (dismissed || installed || isNative() || isStandalone()) return { kind: "hidden" };
  if (event) return { kind: "prompt", install, dismiss };
  if (isIosSafari()) return { kind: "ios", dismiss };
  return { kind: "hidden" };
}
