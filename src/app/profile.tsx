import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Profile {
  name: string;
  city: string;
  church: string;
  goal: string;
  code: string;
  groupCode: string | null;
  createdAt: number;
}

const KEY = "berean:profile:v1";

export const GOALS = [
  { id: "consistency", label: "I want to read consistently", emoji: "🔥" },
  { id: "returning", label: "I'm coming back after a break", emoji: "🌱" },
  { id: "exploring", label: "I'm exploring the faith", emoji: "🧭" },
  { id: "deeper", label: "I want to go deeper in study", emoji: "📖" },
] as const;

const makeCode = () =>
  "BRN-" +
  Math.random().toString(36).slice(2, 6).toUpperCase();

interface ProfileCtx {
  profile: Profile | null;
  complete: (p: { name: string; city: string; church: string; goal: string }) => void;
  save: (p: Partial<Profile>) => void;
  joinGroup: (code: string) => void;
  leaveGroup: () => void;
  resetProfile: () => void;
}

const Ctx = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Profile) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (profile) localStorage.setItem(KEY, JSON.stringify(profile));
      else localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, [profile]);

  const complete = useCallback((p: { name: string; city: string; church: string; goal: string }) => {
    setProfile({
      name: p.name.trim() || "Friend",
      city: p.city.trim(),
      church: p.church.trim(),
      goal: p.goal,
      code: makeCode(),
      groupCode: null,
      createdAt: Date.now(),
    });
  }, []);

  const save = useCallback((p: Partial<Profile>) => {
    setProfile((s) => (s ? { ...s, ...p } : s));
  }, []);

  const joinGroup = useCallback((code: string) => {
    setProfile((s) => (s ? { ...s, groupCode: code.toUpperCase().trim() } : s));
  }, []);

  const leaveGroup = useCallback(() => {
    setProfile((s) => (s ? { ...s, groupCode: null } : s));
  }, []);

  const resetProfile = useCallback(() => setProfile(null), []);

  const value = useMemo(
    () => ({ profile, complete, save, joinGroup, leaveGroup, resetProfile }),
    [profile, complete, save, joinGroup, leaveGroup, resetProfile]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useProfile must be used inside ProfileProvider");
  return c;
}
