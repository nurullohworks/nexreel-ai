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
import { supabase } from "@/integrations/supabase/client";
import {
  TelegramBotService,
  type TelegramBotConfig,
  type PaymentRequestPayload,
  DEFAULT_BOT_CONFIG,
} from "./services/telegram-bot";
import { ActivationService } from "./services/activation";

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

export interface PlanPricingConfig {
  id: PlanId;
  name: string;
  priceUzSum: number;
  priceUsd: number;
  analysisLimit: number;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  category: "news" | "promo" | "update";
  createdAt: string;
  isActive: boolean;
}

export interface UserAccessGrant {
  id: string;
  identifier: string; // phone (+998901234567) or email (user@gmail.com)
  plan: PlanId;
  grantedAt: string;
  expiresAt: string;
  note?: string;
  isActive: boolean;
}

export const PLAN_LIMITS: Record<PlanId, number> = { free: 2, pro: 100, agency: 500 };

export const DEFAULT_PLAN_PRICING: Record<PlanId, PlanPricingConfig> = {
  free: { id: "free", name: "Free Boshlang'ich", priceUzSum: 0, priceUsd: 0, analysisLimit: 2 },
  pro: { id: "pro", name: "Pro Yaratuvchi", priceUzSum: 190000, priceUsd: 15, analysisLimit: 100 },
  agency: { id: "agency", name: "Agency & SMM", priceUzSum: 490000, priceUsd: 39, analysisLimit: 500 },
};

export const DEFAULT_ANNOUNCEMENTS: AdminAnnouncement[] = [
  {
    id: "ann_1",
    title: "Meta 2026 Algoritmi yangilandi!",
    content: "NEXREEL AI tizimiga Meta Reels 5 drayverli diagnostikasi va to'liq soniyali tahlil tizimi ulandi.",
    category: "update",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

export const DEFAULT_USER_GRANTS: UserAccessGrant[] = [
  {
    id: "grant_admin_default",
    identifier: "farkhadivichcreatorai@gmail.com",
    plan: "agency",
    grantedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
    note: "Asosiy Administrator Hisobi (Farkhadivich)",
    isActive: true,
  },
];

interface AppState {
  user: AppUser | null;
  analyses: Analysis[];
  subscription: Subscription;
  instagramConnected: boolean;
  instagramAccount: InstagramAccount | null;
}

export interface AppStore extends AppState {
  hydrated: boolean;
  signIn: (email: string, name?: string) => void;
  signOut: () => Promise<void>;
  addAnalysis: (analysis: Analysis) => Promise<void>;
  setActualViews: (id: string, views: number) => void;
  setPlan: (plan: PlanId, cycle?: "monthly" | "yearly", customExpiry?: string) => void;
  cancelSubscription: () => void;
  toggleInstagram: () => void;
  connectInstagram: (account: Partial<InstagramAccount>) => void;
  disconnectInstagram: () => void;
  canAnalyze: boolean;

  // Admin & Expiry
  pricingConfig: Record<PlanId, PlanPricingConfig>;
  announcements: AdminAnnouncement[];
  userGrants: UserAccessGrant[];
  adminPin: string;
  updatePricing: (planId: PlanId, newConfig: Partial<PlanPricingConfig>) => void;
  addAnnouncement: (item: Omit<AdminAnnouncement, "id" | "createdAt">) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  grantUserAccess: (identifier: string, plan: PlanId, durationDays: number, note?: string) => void;
  revokeUserAccess: (id: string) => void;
  setAdminPin: (pin: string) => void;
  daysUntilExpiry: number | null;
  isExpiringSoon: boolean;
  isExpired: boolean;

  // Telegram Bot & Payment Requests
  paymentRequests: PaymentRequestPayload[];
  telegramBotConfig: TelegramBotConfig;
  addPaymentRequest: (
    req: Omit<PaymentRequestPayload, "id" | "createdAt" | "status">
  ) => Promise<{ success: boolean; error?: string }>;
  approvePaymentRequest: (id: string, days?: number) => void;
  rejectPaymentRequest: (id: string) => void;
  updateTelegramBotConfig: (config: Partial<TelegramBotConfig>) => void;
  activateCode: (code: string) => { success: boolean; message: string; plan?: PlanId };
  activateGrantToken: (token: string) => { success: boolean; message: string; plan?: PlanId; userContact?: string };
}

export const DEFAULT_USER: AppUser = {
  id: "farkhadivich_admin_user",
  name: "Farkhadivich",
  email: "farkhadivichcreatorai@gmail.com",
};

const defaultState: AppState = {
  user: DEFAULT_USER,
  analyses: seedAnalyses,
  subscription: {
    plan: "agency",
    status: "active",
    renewsAt: "2027-12-31T23:59:59.000Z",
    usedThisMonth: 0,
    monthlyLimit: PLAN_LIMITS.agency,
    billingCycle: "yearly",
  },
  instagramConnected: false,
  instagramAccount: null,
};

const KEY = "nexreel.state.v4";
const LEGACY_KEY = "reelpredict.state.v3";
const AUTH_KEY = "nexreel.auth.user";
const ADMIN_KEY = "nexreel.admin.v1";
const AppContext = createContext<AppStore | null>(null);

interface AdminData {
  pricingConfig: Record<PlanId, PlanPricingConfig>;
  announcements: AdminAnnouncement[];
  userGrants: UserAccessGrant[];
  adminPin: string;
  paymentRequests: PaymentRequestPayload[];
  telegramBotConfig: TelegramBotConfig;
}

const defaultAdminData: AdminData = {
  pricingConfig: DEFAULT_PLAN_PRICING,
  announcements: DEFAULT_ANNOUNCEMENTS,
  userGrants: DEFAULT_USER_GRANTS,
  adminPin: "7727",
  paymentRequests: [],
  telegramBotConfig: TelegramBotService.getConfig(),
};

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [adminData, setAdminData] = useState<AdminData>(defaultAdminData);
  const [hydrated, setHydrated] = useState(false);

  // 1. LocalStorage-dan tiklash (Muntazam sessiya saqlash va Admin holati)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY) || window.localStorage.getItem(LEGACY_KEY);
      const savedAuth = window.localStorage.getItem(AUTH_KEY);
      const savedAdmin = window.localStorage.getItem(ADMIN_KEY);

      if (savedAdmin) {
        try {
          const parsedAdmin = JSON.parse(savedAdmin) as Partial<AdminData>;
          setAdminData((prev) => ({
            ...prev,
            ...parsedAdmin,
            pricingConfig: { ...DEFAULT_PLAN_PRICING, ...(parsedAdmin.pricingConfig || {}) },
          }));
        } catch {
          /* ignore */
        }
      }

      let persistentUser: AppUser = DEFAULT_USER;
      if (savedAuth) {
        try {
          const parsedAuth = JSON.parse(savedAuth);
          if (parsedAuth && (parsedAuth.email || parsedAuth.name)) {
            if (parsedAuth.email === "creator@nexreel.ai") {
              persistentUser = DEFAULT_USER;
            } else {
              persistentUser = parsedAuth;
            }
          }
        } catch {
          /* ignore */
        }
      }

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        const finalUser = parsed.user?.email === "creator@nexreel.ai" ? DEFAULT_USER : (parsed.user || persistentUser);
        setState({
          ...defaultState,
          ...parsed,
          user: finalUser,
        });
      } else {
        setState((prev) => ({
          ...prev,
          user: persistentUser,
        }));
      }

      if (
        persistentUser.email &&
        (persistentUser.email.toLowerCase().includes("farkhadivich") ||
         persistentUser.email.toLowerCase() === "farkhadivichcreatorai@gmail.com")
      ) {
        try {
          window.localStorage.setItem("nexreel_admin_device", "true");
        } catch {}
      }
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  // 2. Supabase Auth tinglash (Faqat haqiqiy o'zgarishlar, refreshda userni o'chirmaydi)
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
      if (state.user) {
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(state.user));
      }
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const signIn = useCallback((email: string, name?: string) => {
    const isFarkhadivich =
      email.toLowerCase().includes("farkhadivich") ||
      email.toLowerCase() === "farkhadivichcreatorai@gmail.com";

    const newUser: AppUser = {
      id: `usr_${Date.now()}`,
      email,
      name: name || (isFarkhadivich ? "Farkhadivich" : email.split("@")[0] || "Creator"),
    };
    try {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      if (
        isFarkhadivich ||
        email.toLowerCase().includes("pray_boy") ||
        email.includes("7727") ||
        email === "admin@nexreel.ai"
      ) {
        window.localStorage.setItem("nexreel_admin_device", "true");
      }
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

  const updatePricing = useCallback((planId: PlanId, newConfig: Partial<PlanPricingConfig>) => {
    setAdminData((prev) => {
      const updated = {
        ...prev,
        pricingConfig: {
          ...prev.pricingConfig,
          [planId]: {
            ...prev.pricingConfig[planId],
            ...newConfig,
          },
        },
      };
      try {
        window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const addAnnouncement = useCallback((item: Omit<AdminAnnouncement, "id" | "createdAt">) => {
    setAdminData((prev) => {
      const newAnn: AdminAnnouncement = {
        ...item,
        id: `ann_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const updated = {
        ...prev,
        announcements: [newAnn, ...prev.announcements],
      };
      try {
        window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const toggleAnnouncement = useCallback((id: string) => {
    setAdminData((prev) => {
      const updated = {
        ...prev,
        announcements: prev.announcements.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
      };
      try {
        window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setAdminData((prev) => {
      const updated = {
        ...prev,
        announcements: prev.announcements.filter((a) => a.id !== id),
      };
      try {
        window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const setAdminPin = useCallback((pin: string) => {
    setAdminData((prev) => {
      const updated = { ...prev, adminPin: pin };
      try {
        window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const setPlan = useCallback(
    (plan: PlanId, cycle: "monthly" | "yearly" = "monthly", customExpiry?: string) => {
      const limit = adminData.pricingConfig[plan]?.analysisLimit || PLAN_LIMITS[plan];
      setState((s) => ({
        ...s,
        subscription: {
          ...s.subscription,
          plan,
          status: "active",
          monthlyLimit: limit,
          billingCycle: cycle,
          renewsAt: customExpiry || new Date(Date.now() + 30 * 86400000).toISOString(),
        },
      }));
    },
    [adminData.pricingConfig],
  );

  const grantUserAccess = useCallback(
    (identifier: string, plan: PlanId, durationDays: number, note?: string) => {
      const cleanId = identifier.trim().toLowerCase();
      const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();
      const newGrant: UserAccessGrant = {
        id: `grant_${Date.now()}`,
        identifier: cleanId,
        plan,
        grantedAt: new Date().toISOString(),
        expiresAt,
        note,
        isActive: true,
      };

      setAdminData((prev) => {
        const filtered = prev.userGrants.filter((g) => g.identifier !== cleanId);
        const updated = {
          ...prev,
          userGrants: [newGrant, ...filtered],
        };
        try {
          window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Agar joriy login qilgan akkaunt mos kelsa yoki identifikator ushbu qurilmaga mo'ljallangan bo'lsa:
      const currentEmail = state.user?.email?.trim().toLowerCase();
      if (currentEmail && (currentEmail === cleanId || cleanId.includes(currentEmail) || cleanId === "me")) {
        setPlan(plan, "monthly", expiresAt);
      }
    },
    [state.user, setPlan],
  );

  const revokeUserAccess = useCallback((id: string) => {
    setAdminData((prev) => {
      const updated = {
        ...prev,
        userGrants: prev.userGrants.filter((g) => g.id !== id),
      };
      try {
        window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Obuna tugash kunlari hisobi
  const daysUntilExpiry = useMemo(() => {
    if (state.subscription.plan === "free") return null;
    const renewDate = new Date(state.subscription.renewsAt).getTime();
    if (isNaN(renewDate)) return null;
    const diffMs = renewDate - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [state.subscription]);

  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

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

  const updateTelegramBotConfig = useCallback((config: Partial<TelegramBotConfig>) => {
    const updated = TelegramBotService.saveConfig(config);
    setAdminData((prev) => {
      const next = { ...prev, telegramBotConfig: updated };
      try {
        window.localStorage.setItem(ADMIN_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const addPaymentRequest = useCallback(
    async (req: Omit<PaymentRequestPayload, "id" | "createdAt" | "status">) => {
      const reqId = `req_${Date.now()}`;
      
      // Telegram Botga 1-klik tugmalari va aktivatsiya kodi bilan xabar yuborish
      const botRes = await TelegramBotService.sendPaymentAlert(
        { ...req, id: reqId },
        adminData.telegramBotConfig
      );

      const newReq: PaymentRequestPayload = {
        ...req,
        id: reqId,
        createdAt: new Date().toISOString(),
        status: "pending",
        activationCode: botRes.activationCode,
      };

      setAdminData((prev) => {
        const updated = {
          ...prev,
          paymentRequests: [newReq, ...prev.paymentRequests],
        };
        try {
          window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      return botRes;
    },
    [adminData.telegramBotConfig],
  );

  const approvePaymentRequest = useCallback(
    (id: string, days: number = 30) => {
      const req = adminData.paymentRequests.find((r) => r.id === id);
      if (req) {
        grantUserAccess(
          req.userContact,
          req.planId as PlanId,
          days,
          `Tasdiqlangan to'lov (${req.priceUzSum.toLocaleString()} so'm)`
        );

        setAdminData((prev) => {
          const updated = {
            ...prev,
            paymentRequests: prev.paymentRequests.map((r) =>
              r.id === id ? { ...r, status: "approved" as const } : r
            ),
          };
          try {
            window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    },
    [adminData.paymentRequests, grantUserAccess],
  );

  const rejectPaymentRequest = useCallback((id: string) => {
    setAdminData((prev) => {
      const updated = {
        ...prev,
        paymentRequests: prev.paymentRequests.map((r) =>
          r.id === id ? { ...r, status: "rejected" as const } : r
        ),
      };
      try {
        window.localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const activateCode = useCallback(
    (codeRaw: string) => {
      const verified = ActivationService.verifyCode(codeRaw);
      if (!verified.valid) {
        return {
          success: false,
          message: verified.error || "Aktivatsiya kodi noto'g'ri yoki muddati o'tgan.",
        };
      }

      const expiresAt = new Date(Date.now() + verified.days * 86400000).toISOString();
      setPlan(verified.plan, verified.days > 90 ? "yearly" : "monthly", expiresAt);
      ActivationService.markCodeUsed(codeRaw);

      if (state.user?.email) {
        grantUserAccess(
          state.user.email,
          verified.plan,
          verified.days,
          `Aktivatsiya kodi orqali (${codeRaw.trim().toUpperCase()})`
        );
      }

      return {
        success: true,
        message: `Tabriklaymiz! ${
          verified.plan === "agency" ? "Agency & SMM" : "Pro Yaratuvchi"
        } tarifi ${verified.days} kunga muvaffaqiyatli faollashtirildi!`,
        plan: verified.plan,
      };
    },
    [setPlan, state.user, grantUserAccess],
  );

  const activateGrantToken = useCallback(
    (tokenStr: string) => {
      const verified = ActivationService.verifyGrantToken(tokenStr);
      if (!verified.valid || !verified.data) {
        return { success: false, message: verified.error || "Dostup tokeni yaroqsiz." };
      }

      const { plan, days, contact, reqId } = verified.data;
      const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
      setPlan(plan, days > 90 ? "yearly" : "monthly", expiresAt);

      grantUserAccess(
        contact,
        plan,
        days,
        `Telegram 1-bosish orqali tasdiqlangan dostup (${contact})`
      );

      if (reqId) {
        approvePaymentRequest(reqId, days);
      }

      return {
        success: true,
        message: `Muvaffaqiyatli! ${contact} uchun ${
          plan === "agency" ? "Agency" : "Pro"
        } tarifi (${days} kun) faollashtirildi!`,
        plan,
        userContact: contact,
      };
    },
    [setPlan, grantUserAccess, approvePaymentRequest],
  );

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

      // Admin & Expiry
      pricingConfig: adminData.pricingConfig,
      announcements: adminData.announcements,
      userGrants: adminData.userGrants,
      adminPin: adminData.adminPin,
      updatePricing,
      addAnnouncement,
      toggleAnnouncement,
      deleteAnnouncement,
      grantUserAccess,
      revokeUserAccess,
      setAdminPin,
      daysUntilExpiry,
      isExpiringSoon,
      isExpired,

      // Telegram Bot & Requests
      paymentRequests: adminData.paymentRequests,
      telegramBotConfig: adminData.telegramBotConfig,
      addPaymentRequest,
      approvePaymentRequest,
      rejectPaymentRequest,
      updateTelegramBotConfig,
      activateCode,
      activateGrantToken,
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
      adminData,
      updatePricing,
      addAnnouncement,
      toggleAnnouncement,
      deleteAnnouncement,
      grantUserAccess,
      revokeUserAccess,
      setAdminPin,
      daysUntilExpiry,
      isExpiringSoon,
      isExpired,
      addPaymentRequest,
      approvePaymentRequest,
      rejectPaymentRequest,
      updateTelegramBotConfig,
      activateCode,
      activateGrantToken,
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