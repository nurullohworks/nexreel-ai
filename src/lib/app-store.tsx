import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedAnalyses } from "./mock-data";
import type { Analysis, PlanId, Subscription } from "./types";
import { supabase } from "@/integrations/supabase/client";

export interface AppUser {
  id?: string;
  name: string;
  email: string;
}

export interface InstagramAccount {
  handle: string;
  followers: number;
  avgReelViews: number;
  avgEngagement: number;
  growth: number;
  consistency: number;
  niche: string;
  isConnected: boolean;
}

export const PLAN_LIMITS: Record<PlanId, number> = { free: 2, pro: 100, agency: 500 };

interface AppState {
  user: AppUser | null;
  analyses: Analysis[];
  subscription: Subscription;
  instagramConnected: boolean;
  instagramAccount: InstagramAccount | null;
}

interface AppStore extends AppState {
  hydrated: boolean;
  signIn: (email: string, name?: string) => void;
  signOut: () => Promise<void>;
  addAnalysis: (analysis: Analysis) => Promise<void>;
  setActualViews: (id: string, views: number) => void;
  setPlan: (plan: PlanId, cycle?: "monthly" | "yearly") => void;
  cancelSubscription: () => void;
  toggleInstagram: () => void;
  connectInstagram: (account: Partial<InstagramAccount>) => void;
  disconnectInstagram: () => void;
  canAnalyze: boolean;
}

export const DEFAULT_USER: AppUser = {
  id: "creator_pro_user",
  name: "Creator",
  email: "creator@nexreel.ai",
};

const defaultState: AppState = {
  user: DEFAULT_USER,
  analyses: seedAnalyses,
  subscription: {
    plan: "free",
    status: "active",
    renewsAt: "2026-12-31T23:59:59.000Z",
    usedThisMonth: 1,
    monthlyLimit: PLAN_LIMITS.free,
    billingCycle: "monthly",
  },
  instagramConnected: false,
  instagramAccount: null,
};

const KEY = "nexreel.state.v4";
const LEGACY_KEY = "reelpredict.state.v3";
const AUTH_KEY = "nexreel.auth.user";
const AppContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // 1. LocalStorage-dan tiklash (Muntazam sessiya saqlash)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY) || window.localStorage.getItem(LEGACY_KEY);
      const savedAuth = window.localStorage.getItem(AUTH_KEY);

      let persistentUser: AppUser = DEFAULT_USER;
      if (savedAuth) {
        try {
          const parsedAuth = JSON.parse(savedAuth);
          if (parsedAuth && (parsedAuth.email || parsedAuth.name)) {
            persistentUser = parsedAuth;
          }
        } catch {}
      }

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        setState({
          ...defaultState,
          ...parsed,
          user: parsed.user || persistentUser,
        });
      } else {
        setState((prev) => ({
          ...prev,
          user: persistentUser,
        }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // 2. Supabase Auth tinglash
  useEffect(() => {
    let authListener: { subscription?: { unsubscribe: () => void } } | null = null;
    try {
      if (supabase?.auth) {
        supabase.auth.getSession().then(({ data }) => {
          if (data?.session?.user) {
            const u = data.session.user;
            const suUser: AppUser = {
              id: u.id,
              email: u.email || "",
              name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Creator",
            };
            try {
              window.localStorage.setItem(AUTH_KEY, JSON.stringify(suUser));
            } catch {}
            setState((prev) => ({
              ...prev,
              user: suUser,
            }));
          }
        }).catch(() => {});

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            const u = session.user;
            const suUser: AppUser = {
              id: u.id,
              email: u.email || "",
              name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Creator",
            };
            try {
              window.localStorage.setItem(AUTH_KEY, JSON.stringify(suUser));
            } catch {}
            setState((prev) => ({
              ...prev,
              user: suUser,
            }));
          } else if (event === "SIGNED_OUT") {
            try {
              window.localStorage.removeItem(AUTH_KEY);
            } catch {}
            setState((prev) => ({ ...prev, user: null }));
          }
        });
        authListener = listener;
      }
    } catch {}

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 3. Holatni LocalStorage-ga saqlash
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      if (state.user) {
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(state.user));
      }
    } catch {}
  }, [state, hydrated]);

  const signIn = useCallback((email: string, name?: string) => {
    const newUser: AppUser = {
      id: `usr_${Date.now()}`,
      email,
      name: name || email.split("@")[0] || "Creator",
    };
    try {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    } catch {}
    setState((s) => ({
      ...s,
      user: newUser,
    }));
  }, []);

  const signOut = useCallback(async () => {
    try {
      window.localStorage.removeItem(AUTH_KEY);
      if (supabase?.auth) {
        await supabase.auth.signOut();
      }
    } catch {}
    setState((s) => ({ ...s, user: null }));
  }, []);

  const addAnalysis = useCallback(async (analysis: Analysis) => {
    setState((s) => ({
      ...s,
      analyses: [analysis, ...s.analyses],
      subscription: { ...s.subscription, usedThisMonth: s.subscription.usedThisMonth + 1 },
    }));

    try {
      if (supabase) {
        await supabase.from("reel_analyses").insert({
          file_name: analysis.fileName,
          owner_key: state.user?.email || "anonymous_user",
          user_id: state.user?.id || null,
          result: analysis as any,
          provider: "gemini-claude-meta-engine",
        });
      }
    } catch (e) {
      console.log("Supabase insert fallback to local storage");
    }
  }, [state.user]);

  const setActualViews = useCallback((id: string, views: number) => {
    setState((s) => ({
      ...s,
      analyses: s.analyses.map((a) => (a.id === id ? { ...a, actualViews: views } : a)),
    }));
  }, []);

  const setPlan = useCallback((plan: PlanId, cycle: "monthly" | "yearly" = "monthly") => {
    setState((s) => ({
      ...s,
      subscription: {
        ...s.subscription,
        plan,
        monthlyLimit: PLAN_LIMITS[plan],
        billingCycle: cycle,
      },
    }));
  }, []);

  const cancelSubscription = useCallback(() => {
    setState((s) => ({
      ...s,
      subscription: { ...s.subscription, status: "canceled" },
    }));
  }, []);

  const toggleInstagram = useCallback(() => {
    setState((s) => ({
      ...s,
      instagramConnected: !s.instagramConnected,
    }));
  }, []);

  const connectInstagram = useCallback((account: Partial<InstagramAccount>) => {
    setState((s) => ({
      ...s,
      instagramConnected: true,
      instagramAccount: {
        handle: account.handle || "@creator",
        followers: account.followers || 10000,
        avgReelViews: account.avgReelViews || 2500,
        avgEngagement: account.avgEngagement || 4.2,
        growth: account.growth || 2.5,
        consistency: account.consistency || 85,
        niche: account.niche || "business",
        isConnected: true,
      },
    }));
  }, []);

  const disconnectInstagram = useCallback(() => {
    setState((s) => ({
      ...s,
      instagramConnected: false,
      instagramAccount: null,
    }));
  }, []);

  const canAnalyze = useMemo(() => {
    return state.subscription.usedThisMonth < state.subscription.monthlyLimit;
  }, [state.subscription]);

  const value = useMemo<AppStore>(
    () => ({
      ...state,
      hydrated,
      signIn,
      signOut,
      addAnalysis,
      setActualViews,
      setPlan,
      cancelSubscription,
      toggleInstagram,
      connectInstagram,
      disconnectInstagram,
      canAnalyze,
    }),
    [
      state,
      hydrated,
      signIn,
      signOut,
      addAnalysis,
      setActualViews,
      setPlan,
      cancelSubscription,
      toggleInstagram,
      connectInstagram,
      disconnectInstagram,
      canAnalyze,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore(): AppStore {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within an AppStoreProvider");
  return ctx;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
