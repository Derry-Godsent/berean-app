import { Lightbulb } from "lucide-react";

/**
 * "Keep the lamp lit" — one amber bulb.
 *
 * Amber is used for giving and for nothing else in Berean, so the colour stays
 * meaningful. The pulse lives in CSS (`.lamp-pulse`, see index.css), which
 * means it also stops for people who have turned animations off in their
 * system settings: the lamp stays lit, it just stops moving.
 */
export function Lamp({
  size = 20,
  glow = 2,
  pulse = true,
  strokeWidth = 1.7,
  className = "",
}: {
  /** Height of the bulb in pixels. */
  size?: number;
  /** Diameter of the halo, as a multiple of the bulb. 0 draws no halo. */
  glow?: number;
  /** Set false for a steady bulb even when animations are welcome. */
  pulse?: boolean;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow > 0 && (
        <span
          aria-hidden
          className={`lamp-halo pointer-events-none absolute rounded-full ${
            pulse ? "lamp-pulse" : ""
          }`}
          style={{ width: Math.round(size * glow), height: Math.round(size * glow) }}
        />
      )}
      <Lightbulb
        aria-hidden
        strokeWidth={strokeWidth}
        className={`relative text-lamp ${pulse ? "lamp-flicker" : ""}`}
        style={{ width: size, height: size, filter: "drop-shadow(0 0 3px var(--lamp-glow))" }}
      />
    </span>
  );
}
