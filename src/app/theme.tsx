import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Skin = "dark" | "light";

const KEY = "berean:skin";

interface ThemeValue {
  skin: Skin;
  setSkin: (skin: Skin) => void;
  toggleSkin: () => void;
}

const ThemeCtx = createContext<ThemeValue | null>(null);

function initialSkin(): Skin {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* Storage may be disabled. */
  }
  // Berean opens in its cinematic dark skin unless the reader chooses otherwise.
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [skin, setSkin] = useState<Skin>(initialSkin);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, skin);
    } catch {
      /* The in-memory choice still works for this visit. */
    }
    document.documentElement.style.colorScheme = skin;
  }, [skin]);

  const value = useMemo(
    () => ({
      skin,
      setSkin,
      toggleSkin: () => setSkin((s) => (s === "dark" ? "light" : "dark")),
    }),
    [skin]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeCtx);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}

export function SkinSwitch({ compact = false }: { compact?: boolean }) {
  const { skin, setSkin, toggleSkin } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleSkin}
        className="border border-line px-2.5 py-1.5 font-mono text-[10px] text-mist transition-colors hover:border-gold hover:text-gold"
        aria-label={`Use ${skin === "dark" ? "light" : "dark"} skin`}
        title={`Switch to ${skin === "dark" ? "light" : "dark"} skin`}
      >
        {skin === "dark" ? "Light" : "Dark"}
      </button>
    );
  }

  return (
    <div className="inline-flex border border-line p-1" aria-label="Colour preference">
      {(["dark", "light"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setSkin(option)}
          className={`px-4 py-2 font-mono text-[11px] capitalize transition-colors ${
            skin === option ? "bg-parchment text-night" : "text-mist hover:text-parchment"
          }`}
          aria-pressed={skin === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}