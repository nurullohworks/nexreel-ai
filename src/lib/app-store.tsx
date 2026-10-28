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

const defaultState: AppState = {
  user: null,
  analyses: seedAnalyses,
  subscription: {
    plan: "free",
    status: "active",
    renewsAt: "2026-03-01T09:00:00.000Z",
    usedThisMonth: 1,
    monthlyLimit: PLAN_LIMITS.free,
    billingCycle: "monthly",
  },
  instagramConnected: false,
  instagramAccount: null, // Boshida hech qanday akkaunt ulanmagan
};

const KEY = "reelpredict.state.v3";
const AppContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // 1. LocalStorage-dan tiklash
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...defaultState, ...(JSON.parse(raw) as AppState) });
    } catch {
      /* ignore corrupt state */
    }
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
            setState((prev) => ({
              ...prev,
              user: {
                id: u.id,
                email: u.email || "",
                name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Creator",
              },
            }));
          }
        }).catch(() => {});

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const u = session.user;
            setState((prev) => ({
              ...prev,
              user: {
                id: u.id,
                email: u.email || "",
                name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Creator",
              },
            }));
          } else {
            setState((prev) => ({ ...prev, user: null }));
          }
        });
        authListener = listener;
      }
    } catch {
      /* Supabase not yet configured */
    }

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 3. Holatni LocalStorage-ga saqlash
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const signIn = useCallback((email: string, name?: string) => {
    setState((s) => ({
      ...s,
      user: { email, name: name || email.split("@")[0] || "Creator" },
    }));
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (supabase?.auth) {
        await supabase.auth.signOut();
      }
    } catch {
      /* ignore */
    }
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
      analyses: s.analyses.map((a) =>
        a.id === id ? { ...a, actualViews: views, status: "Completed" } : a,
      ),
    }));
  }, []);

  const setPlan = useCallback((plan: PlanId, cycle: "monthly" | "yearly" = "monthly") => {
    setState((s) => ({
      ...s,
      subscription: {
        ...s.subscription,
        plan,
        status: "active",
        monthlyLimit: PLAN_LIMITS[plan],
        billingCycle: cycle,
        renewsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
    }));
  }, []);

  const cancelSubscription = useCallback(
    () => setState((s) => ({ ...s, subscription: { ...s.subscription, status: "canceled" } })),
    [],
  );

  const toggleInstagram = useCallback(
    () => setState((s) => ({ ...s, instagramConnected: !s.instagramConnected })),
    [],
  );

  const connectInstagram = useCallback((account: Partial<InstagramAccount>) => {
    const handle = account.handle?.startsWith("@") ? account.handle : `@${account.handle || "my.instagram"}`;
    const newAcc: InstagramAccount = {
      handle,
      followers: account.followers || 3000,
      avgReelViews: account.avgReelViews || 1500,
      avgEngagement: account.avgEngagement || 4.8,
      growth: account.growth || 11.2,
      consistency: account.consistency || 85,
      niche: account.niche || "business",
      isConnected: true,
    };
    setState((s) => ({
      ...s,
      instagramConnected: true,
      instagramAccount: newAcc,
    }));
  }, []);

  const disconnectInstagram = useCallback(() => {
    setState((s) => ({
      ...s,
      instagramConnected: false,
      instagramAccount: null,
    }));
  }, []);

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
      canAnalyze: state.subscription.usedThisMonth < state.subscription.monthlyLimit,
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
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}

export function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `${n}`;
}