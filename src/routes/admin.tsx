import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Unlock,
  DollarSign,
  Users,
  Megaphone,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Key,
  Calendar,
  Smartphone,
  Mail,
  Sparkles,
  RefreshCw,
  LogOut,
  ExternalLink,
  Phone,
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Loader2,
  Sliders,
  Cpu,
  Zap,
  BarChart3,
  Search,
  Filter,
  ArrowUpRight,
  Activity,
  CheckCheck,
  CreditCard,
  Layers,
  Power,
  Globe,
  Settings,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAppStore,
  DEFAULT_PLAN_PRICING,
  DEFAULT_PLATFORM_SETTINGS,
  type PlanPricingConfig,
  type PlatformSettings,
} from "@/lib/app-store";
import type { PlanId } from "@/lib/types";
import { TelegramBotService } from "@/lib/services/telegram-bot";
import { PaymentService } from "@/lib/services/payment";
import { MetaAlgorithmService, type MetaAlgorithmWeights } from "@/lib/services/meta-algorithm";
import { LiveDuneService } from "@/lib/services/livedune";
import { CreditEconomyService, MODEL_CREDIT_COSTS, PLAN_CREDITS } from "@/lib/services/credit-economy";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Markaziy Konsoli — NEXREEL AI" },
      { name: "description", content: "NEXREEL AI to'liq boshqaruv konsoli, funksiyalar, narxlar va obunalar." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const {
    pricingConfig,
    updatePricing,
    platformSettings,
    updatePlatformSettings,
    resetPlatformSettings,
    announcements,
    addAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    userGrants,
    grantUserAccess,
    revokeUserAccess,
    updateUserGrantPlan,
    extendUserGrant,
    toggleUserGrantStatus,
    adminPin,
    setAdminPin,
    setPlan,
    user,
    paymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    telegramBotConfig,
    updateTelegramBotConfig,
  } = useAppStore();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "features" | "users" | "pricing" | "payments" | "announcements" | "security"
  >("overview");

  // Device memory check
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (
          user?.email &&
          (user.email.toLowerCase().includes("farkhadivich") ||
            user.email.toLowerCase() === "farkhadivichcreatorai@gmail.com")
        ) {
          localStorage.setItem("nexreel_admin_device", "true");
        }
        setIsUnlocked(sessionStorage.getItem("nexreel_admin_unlocked") === "true");
      } catch {}
    }
  }, [user]);

  // Platform Feature Settings State
  const [featureConfig, setFeatureConfig] = useState<PlatformSettings>(() => ({
    ...DEFAULT_PLATFORM_SETTINGS,
    ...(platformSettings || {}),
  }));

  useEffect(() => {
    if (platformSettings) {
      setFeatureConfig((prev) => ({ ...prev, ...platformSettings }));
    }
  }, [platformSettings]);

  // Support & Merchant Settings State
  const [supportTelegramInput, setSupportTelegramInput] = useState(
    () => platformSettings?.supportTelegram || PaymentService.getSupportContact().username
  );
  const [supportPhoneInput, setSupportPhoneInput] = useState(
    () => platformSettings?.supportPhone || PaymentService.getSupportContact().phone
  );
  const [clickServiceId, setClickServiceId] = useState(
    () => PaymentService.getMerchantConfig().clickServiceId
  );
  const [clickMerchantId, setClickMerchantId] = useState(
    () => PaymentService.getMerchantConfig().clickMerchantId
  );
  const [paymeMerchantId, setPaymeMerchantId] = useState(
    () => PaymentService.getMerchantConfig().paymeMerchantId
  );

  // Bot Settings State
  const [botTokenInput, setBotTokenInput] = useState(telegramBotConfig?.botToken || "");
  const [chatIdInput, setChatIdInput] = useState(telegramBotConfig?.chatId || "");
  const [isTestingBot, setIsTestingBot] = useState(false);

  // Meta Algorithm & LiveDune Sync State
  const [metaWeights, setMetaWeights] = useState<MetaAlgorithmWeights>(() =>
    MetaAlgorithmService.getWeights()
  );
  const [liveDuneSyncInfo, setLiveDuneSyncInfo] = useState(() => LiveDuneService.getSyncInfo());
  const [isSyncingAlgo, setIsSyncingAlgo] = useState(false);

  const handleSyncAlgorithmAndLiveDune = async () => {
    setIsSyncingAlgo(true);
    await new Promise((r) => setTimeout(r, 650));
    const algoRes = MetaAlgorithmService.autoSyncAlgorithmNews();
    const ldRes = LiveDuneService.syncLatestBenchmarks();
    setMetaWeights(MetaAlgorithmService.getWeights());
    setLiveDuneSyncInfo(LiveDuneService.getSyncInfo());
    setIsSyncingAlgo(false);
    toast.success("Meta 2026 va LiveDune muvaffaqiyatli sinxronlashtirildi!", {
      description: `${algoRes.version} • ${ldRes.message}`,
    });
  };

  const handleSaveMetaWeights = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = MetaAlgorithmService.saveWeights(metaWeights);
    setMetaWeights(updated);
    toast.success("Meta algoritm drayverlari og'irligi muvaffaqiyatli saqlandi!");
  };

  // Pricing Form State
  const [editablePricing, setEditablePricing] = useState<Record<PlanId, PlanPricingConfig>>(pricingConfig);

  // User Grant Form State
  const [grantIdentifier, setGrantIdentifier] = useState("");
  const [grantPlan, setGrantPlan] = useState<PlanId>("pro");
  const [grantDays, setGrantDays] = useState("30");
  const [grantNote, setGrantNote] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | "active" | "expired" | "pro" | "agency" | "free">("all");

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annCategory, setAnnCategory] = useState<"news" | "promo" | "update">("update");

  // New PIN Form State
  const [newPin, setNewPin] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem("nexreel_admin_unlocked", "true");
        localStorage.setItem("nexreel_admin_device", "true");
      } catch {}
      toast.success("Admin markaziy boshqaruv paneliga muvaffaqiyatli kirdingiz!");
    } else {
      toast.error("Noto'g'ri PIN-kod! Iltimos, qaytadan urinib ko'ring.");
    }
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem("nexreel_admin_unlocked");
    } catch {}
    toast.info("Admin paneldan chiqildi.");
  };

  // 1. SAVE FEATURES & PLATFORM SETTINGS
  const handleSaveFeatures = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings(featureConfig);
    toast.success("Platforma sozlamalari va funksiyalari muvaffaqiyatli saqlandi!", {
      description: "O'zgarishlar barcha foydalanuvchilar ekranida zudlik bilan kuchga kirdi.",
    });
  };

  // 2. SAVE PAYMENT & SUPPORT SETTINGS
  const handleSavePaymentAndSupport = (e: React.FormEvent) => {
    e.preventDefault();
    PaymentService.saveMerchantConfig({
      clickServiceId: clickServiceId.trim(),
      clickMerchantId: clickMerchantId.trim(),
      paymeMerchantId: paymeMerchantId.trim(),
    });

    PaymentService.saveSupportContact({
      username: supportTelegramInput.trim(),
      phone: supportPhoneInput.trim(),
      displayPhone: supportPhoneInput.trim(),
    });

    updatePlatformSettings({
      supportTelegram: supportTelegramInput.trim(),
      supportPhone: supportPhoneInput.trim(),
    });

    toast.success("To'lov shlyuzlari va aloqa kontaktlari muvaffaqiyatli saqlandi!", {
      description: `Telegram: @${supportTelegramInput.replace("@", "")}, Tel: ${supportPhoneInput}`,
    });
  };

  // 3. SAVE TELEGRAM BOT CONFIG
  const handleSaveBotConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botTokenInput.trim() || !chatIdInput.trim()) {
      toast.error("Bot Token va Chat ID maydonlarini to'ldiring!");
      return;
    }
    updateTelegramBotConfig({
      botToken: botTokenInput.trim(),
      chatId: chatIdInput.trim(),
      enabled: true,
    });
    toast.success("Telegram Bot sozlamalari muvaffaqiyatli saqlandi!");
  };

  const handleTestBot = async () => {
    if (!botTokenInput.trim() || !chatIdInput.trim()) {
      toast.error("Avval Bot Token va Chat ID ni kiriting!");
      return;
    }
    setIsTestingBot(true);
    const res = await TelegramBotService.sendTestMessage({
      botToken: botTokenInput.trim(),
      chatId: chatIdInput.trim(),
      enabled: true,
    });
    setIsTestingBot(false);
    if (res.success) {
      toast.success("Ajoyib! Telegram botingizga test xabari yetib bordi!", {
        description: "Botingizni tekshirib ko'ring.",
      });
    } else {
      toast.error(`Telegram xatoligi: ${res.error || "Token yoki Chat ID noto'g'ri"}`);
    }
  };

  // 4. SAVE PRICING
  const handleSavePrice = (planId: PlanId) => {
    const config = editablePricing[planId];
    updatePricing(planId, config);
    toast.success(`${config.name} tarifi yangilandi!`, {
      description: `${config.priceUzSum.toLocaleString()} so'm / $${config.priceUsd} (${config.analysisLimit} ta limit)`,
    });
  };

  const handleResetPricing = () => {
    setEditablePricing(DEFAULT_PLAN_PRICING);
    Object.keys(DEFAULT_PLAN_PRICING).forEach((id) => {
      updatePricing(id as PlanId, DEFAULT_PLAN_PRICING[id as PlanId]);
    });
    toast.info("Barcha narxlar standart holatiga qaytarildi.");
  };

  // 5. USER GRANT ACTIONS
  const handleAddGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantIdentifier.trim()) {
      toast.error("Telefon raqam yoki Google/Email kiriting!");
      return;
    }
    const days = parseInt(grantDays) || 30;
    grantUserAccess(grantIdentifier.trim(), grantPlan, days, grantNote.trim());
    toast.success(`Dostup berildi: ${grantIdentifier}`, {
      description: `${grantPlan.toUpperCase()} tarifi ${days} kunga faollashtirildi.`,
    });
    setGrantIdentifier("");
    setGrantNote("");
  };

  const handleGrantCurrentSession = (plan: PlanId, days: number = 30) => {
    const email = user?.email || "farkhadivichcreatorai@gmail.com";
    grantUserAccess(email, plan, days, "Admin tezkor sinovi");
    toast.success(`Joriy hisobingizga ${plan.toUpperCase()} tarifi ulandi!`, {
      description: `${days} kun davomida faol.`,
    });
  };

  // 6. ANNOUNCEMENTS
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      toast.error("Sarlavha va matnni to'ldiring!");
      return;
    }
    addAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      category: annCategory,
      isActive: true,
    });
    toast.success("Yangi e'lon muvaffaqiyatli chiqarildi!");
    setAnnTitle("");
    setAnnContent("");
  };

  // 7. SECURITY & PIN
  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.trim().length < 4) {
      toast.error("Yangi PIN-kod kamida 4 xonali bo'lishi kerak!");
      return;
    }
    setAdminPin(newPin.trim());
    toast.success("Admin PIN-kodi muvaffaqiyatli o'zgartirildi!");
    setNewPin("");
  };

  // Filtered Users List
  const filteredUsers = userGrants.filter((grant) => {
    const matchesQuery =
      grant.identifier.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (grant.note || "").toLowerCase().includes(userSearchQuery.toLowerCase());
    if (!matchesQuery) return false;

    const daysLeft = Math.ceil(
      (new Date(grant.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const isExpired = daysLeft < 0;

    if (userFilter === "active") return grant.isActive && !isExpired;
    if (userFilter === "expired") return isExpired || !grant.isActive;
    if (userFilter === "pro") return grant.plan === "pro";
    if (userFilter === "agency") return grant.plan === "agency";
    if (userFilter === "free") return grant.plan === "free";
    return true;
  });

  // Financial Stats Calculation
  const totalApprovedSum = paymentRequests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + (r.priceUzSum || 0), 0);
  const totalApprovedUsd = paymentRequests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + (r.priceUsd || 0), 0);

  // LOCKED STATE VIEW
  if (!isUnlocked) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] items-center justify-center py-12 px-4">
          <div className="surface-card w-full max-w-md p-8 border border-cyan-500/30 rounded-3xl shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
              <Lock className="h-8 w-8" />
            </div>

            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                Xavfsiz Boshqaruv
              </span>
              <h1 className="text-2xl font-black text-foreground mt-1 tracking-tight">
                NEXREEL Markaziy Admin Paneli
              </h1>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Platforma funksiyalari, narxlari, foydalanuvchilar va to'lovlarni boshqarish uchun 4 xonali PIN-kodni kiriting.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <Input
                type="password"
                maxLength={8}
                placeholder="PIN-kodni kiriting (Standart: 7727)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="text-center font-mono text-xl tracking-widest h-12 bg-surface/80"
                autoFocus
              />

              <Button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm h-12 shadow-lg shadow-cyan-500/20 rounded-xl"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Panelga Kirish
              </Button>
            </form>

            <div className="rounded-xl border border-border/80 bg-surface/50 p-3 text-[11px] text-muted-foreground text-left flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Farkhadivich (Asosiy Administrator) qurilmasi uchun xavfsizlik protokoli faollashtirilgan. Standart PIN: <strong>7727</strong>
              </span>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // UNLOCKED STATE - FULL FLAVORED COCKPIT
  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Markaziy Boshqaruv Konsoli</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-mono">
                ONLINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1 tracking-tight">
              NEXREEL AI Admin Cockpit
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Platformaning barcha funksiyalarini, foydalanuvchilarini, narxlarini va to'lov tizimlarini to'liq boshqaring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGrantCurrentSession("agency", 365)}
              className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 font-bold"
            >
              <Zap className="h-3.5 w-3.5 mr-1" />
              1 Yillik VIP Dostup
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Chiqish
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Umumiy Boshqaruv
          </button>

          <button
            onClick={() => setActiveTab("features")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "features"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Sliders className="h-4 w-4" />
            Funksiyalar & AI Dvigatel
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Foydalanuvchilar & Dostuplar ({userGrants.length})
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "pricing"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Tariflar & Narxlar
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all relative ${
              activeTab === "payments"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>To'lovlar & Shlyuzlar</span>
            {paymentRequests?.filter((r) => r.status === "pending").length > 0 && (
              <span className="rounded-full bg-red-500 text-white px-1.5 py-0.2 text-[10px] font-mono font-bold animate-pulse">
                {paymentRequests.filter((r) => r.status === "pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "announcements"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Megaphone className="h-4 w-4" />
            E'lonlar & Yangiliklar ({announcements.filter((a) => a.isActive).length})
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "security"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Key className="h-4 w-4" />
            Xavfsizlik & PIN
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-card p-5 rounded-2xl border-cyan-500/20 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
                  <span>Jami Foydalanuvchilar</span>
                  <Users className="h-4 w-4 text-cyan-400" />
                </span>
                <div className="text-3xl font-black text-foreground">{userGrants.length} ta</div>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCheck className="h-3 w-3" /> Tizimda qayd etilgan
                </span>
              </div>

              <div className="surface-card p-5 rounded-2xl border-emerald-500/20 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
                  <span>Faol Pro / Agency</span>
                  <Zap className="h-4 w-4 text-emerald-400" />
                </span>
                <div className="text-3xl font-black text-emerald-400">
                  {userGrants.filter((g) => g.isActive && g.plan !== "free").length} ta
                </div>
                <span className="text-[11px] text-muted-foreground">Cheklovlarsiz foydalanuvchilar</span>
              </div>

              <div className="surface-card p-5 rounded-2xl border-blue-500/20 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
                  <span>Tasdiqlangan Daromad</span>
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </span>
                <div className="text-2xl font-black text-foreground">
                  {totalApprovedSum.toLocaleString()} so'm
                </div>
                <span className="text-[11px] text-cyan-300 font-mono font-bold">
                  ≈ ${totalApprovedUsd} jami tushum
                </span>
              </div>

              <div className="surface-card p-5 rounded-2xl border-purple-500/20 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
                  <span>AI Dvigateli & Holat</span>
                  <Cpu className="h-4 w-4 text-purple-400" />
                </span>
                <div className="text-lg font-bold text-foreground truncate">
                  {featureConfig.aiModel || "Gemini 2.5 Flash"}
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {featureConfig.maintenanceMode ? "🛑 Texnik rejimda" : "⚡ Barcha funksiyalar faol"}
                </span>
              </div>
            </div>

            {/* Quick Action Control Bar */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-card to-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Markaziy Boshqaruv Qulayliklari
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Platformani boshqa odamlar foydalanishi uchun bir zumda moslashtiring yoki cheklovlarni o'zgartiring.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setActiveTab("features")}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  <Sliders className="h-3.5 w-3.5 mr-1" />
                  Funksiyalarni Boshqarish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("users")}
                  className="text-xs border-cyan-500/30 text-cyan-300"
                >
                  <Users className="h-3.5 w-3.5 mr-1" />
                  Yangi Dostup Berish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("payments")}
                  className="text-xs border-border"
                >
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                  Click & Payme
                </Button>
              </div>
            </div>

            {/* Live System Feature Status Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  Joriy Funksiyalar Holati (Live Toggles)
                </h3>
                <div className="divide-y divide-border/40 text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span>Instagram Reels Havolasi orqali tahlil:</span>
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded-full text-[10px] ${
                        featureConfig.enableInstagramLink
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {featureConfig.enableInstagramLink ? "YOQILGAN" : "O'CHIRILGAN"}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span>AI Ssenariy & 5x Viral Hook generatori:</span>
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded-full text-[10px] ${
                        featureConfig.enableAiScriptGen
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {featureConfig.enableAiScriptGen ? "YOQILGAN" : "O'CHIRILGAN"}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span>1-bosishli A4 PDF Audit Eksporti:</span>
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded-full text-[10px] ${
                        featureConfig.enablePdfAuditExport
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {featureConfig.enablePdfAuditExport ? "YOQILGAN" : "O'CHIRILGAN"}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span>Click & Payme orqali avtomatik dostup:</span>
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded-full text-[10px] ${
                        featureConfig.autoApprovePayments
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {featureConfig.autoApprovePayments ? "AVTOMATIK (0 KUTISH)" : "QO'LDA TASDIQLASH"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Payment Requests Card */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    Kutilayotgan So'rovlar
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-cyan-400 p-0 h-auto"
                    onClick={() => setActiveTab("payments")}
                  >
                    Barchasini ko'rish →
                  </Button>
                </div>
                {paymentRequests.filter((r) => r.status === "pending").length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400/50 mx-auto mb-2" />
                    Barcha to'lovlar qayta ishlangan! Yangi kutilayotgan so'rov yo'q.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paymentRequests
                      .filter((r) => r.status === "pending")
                      .slice(0, 3)
                      .map((req) => (
                        <div
                          key={req.id}
                          className="p-2.5 rounded-xl bg-surface/70 border border-border/60 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-foreground block">{req.userContact}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {req.planName} • {req.priceUzSum.toLocaleString()} so'm
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="h-7 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                            onClick={() => approvePaymentRequest(req.id, 30)}
                          >
                            Tasdiqlash
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PLATFORM FEATURES & AI ENGINE CONTROLS */}
        {/* ========================================================================= */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <form onSubmit={handleSaveFeatures} className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Platforma Funksiyalari & Sozlamalari</h2>
                <p className="text-xs text-muted-foreground">
                  Istalgan funksiyani 1 ta tugma bilan yoqing, o'chiring yoki chegaralarini boshqaring.
                </p>
              </div>
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs h-9 shadow-md shadow-cyan-500/20"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                O'zgarishlarni Saqlash
              </Button>
            </div>

            {/* MASTER FEATURE SWITCHES */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Instagram Link Analysis Toggle */}
              <div className="p-4 rounded-2xl border border-border/80 bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-pink-400" />
                    <span className="text-xs font-bold text-foreground">Instagram Link Tahlili</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureConfig.enableInstagramLink}
                    onChange={(e) =>
                      setFeatureConfig((prev) => ({ ...prev, enableInstagramLink: e.target.checked }))
                    }
                    className="h-5 w-5 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Foydalanuvchilar to'g'ridan-to'g'ri Instagram Reels havolasini qo'yib tahlil qila olishini boshqarish.
                </p>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full inline-block ${
                    featureConfig.enableInstagramLink ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {featureConfig.enableInstagramLink ? "FAOL (YOQILGAN)" : "TO'XTATILGAN"}
                </span>
              </div>

              {/* AI Script & Hook Generator Toggle */}
              <div className="p-4 rounded-2xl border border-border/80 bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-foreground">AI Ssenariy & 5x Hook</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureConfig.enableAiScriptGen}
                    onChange={(e) =>
                      setFeatureConfig((prev) => ({ ...prev, enableAiScriptGen: e.target.checked }))
                    }
                    className="h-5 w-5 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tahlildan so'ng videoni virusli qilish uchun 5 xil hook va professional ssenariy generatsiya kartasi.
                </p>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full inline-block ${
                    featureConfig.enableAiScriptGen ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {featureConfig.enableAiScriptGen ? "FAOL (YOQILGAN)" : "TO'XTATILGAN"}
                </span>
              </div>

              {/* PDF Audit Export Toggle */}
              <div className="p-4 rounded-2xl border border-border/80 bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-foreground">A4 PDF Audit Eksporti</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureConfig.enablePdfAuditExport}
                    onChange={(e) =>
                      setFeatureConfig((prev) => ({ ...prev, enablePdfAuditExport: e.target.checked }))
                    }
                    className="h-5 w-5 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Foydalanuvchilarga to'liq tahlil hisobotini 1 bosishda A4 formatidagi PDF fayl sifatida saqlash imkoniyati.
                </p>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full inline-block ${
                    featureConfig.enablePdfAuditExport ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {featureConfig.enablePdfAuditExport ? "FAOL (YOQILGAN)" : "TO'XTATILGAN"}
                </span>
              </div>

              {/* Automatic Instant Payment Access Toggle */}
              <div className="p-4 rounded-2xl border border-border/80 bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs font-bold text-foreground">Avtomatik To'lov & Dostup</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureConfig.autoApprovePayments}
                    onChange={(e) =>
                      setFeatureConfig((prev) => ({ ...prev, autoApprovePayments: e.target.checked }))
                    }
                    className="h-5 w-5 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Mijoz Click yoki Payme orqali to'laganda kutishsiz 0 soniyada obunani avtomatik ochish tizimi.
                </p>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full inline-block ${
                    featureConfig.autoApprovePayments ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {featureConfig.autoApprovePayments ? "AVTOMATIK YOQILGAN" : "QO'LDA TASDIQLASH"}
                </span>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-foreground">Texnik Ishlar Rejimi</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureConfig.maintenanceMode}
                    onChange={(e) =>
                      setFeatureConfig((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
                    }
                    className="h-5 w-5 rounded accent-amber-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Sayt tepasida rejaviy texnik ishlar bannerini yoqadi va foydalanuvchilarni ogohlantiradi.
                </p>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full inline-block ${
                    featureConfig.maintenanceMode ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {featureConfig.maintenanceMode ? "TEXNIK REJIM FAOL" : "NORMAL REJIM"}
                </span>
              </div>

              {/* Global Banner Switch */}
              <div className="p-4 rounded-2xl border border-border/80 bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-foreground">Yuqori Sayt Banneri</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureConfig.showGlobalBanner}
                    onChange={(e) =>
                      setFeatureConfig((prev) => ({ ...prev, showGlobalBanner: e.target.checked }))
                    }
                    className="h-5 w-5 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Saytning eng yuqori qismida barcha sahifalarda chiquvchi maxsus xabar banneri.
                </p>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full inline-block ${
                    featureConfig.showGlobalBanner ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {featureConfig.showGlobalBanner ? "KO'RSATILMOQDA" : "YASHIRILGAN"}
                </span>
              </div>
            </div>

            {/* AI MODEL & PARAMETERS CONFIGURATION */}
            <div className="rounded-2xl border border-cyan-500/30 bg-card/60 p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                Sun'iy Intellekt (AI) Dvigatel Parametrlari
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Asosiy AI Model:
                  </label>
                  <select
                    value={featureConfig.aiModel}
                    onChange={(e) => setFeatureConfig((prev) => ({ ...prev, aiModel: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-1 text-xs text-foreground font-semibold"
                  >
                    <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra tezkor, tavsiya etiladi)</option>
                    <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Chuqur tahlil)</option>
                    <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Yuqori aniqlik)</option>
                    <option value="gpt-4o">OpenAI GPT-4o (Multimodal)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    AI Tahlil Qat'iyligi (Diagnostika):
                  </label>
                  <select
                    value={featureConfig.aiStrictness}
                    onChange={(e) =>
                      setFeatureConfig((prev) => ({
                        ...prev,
                        aiStrictness: e.target.value as "balanced" | "strict" | "creative",
                      }))
                    }
                    className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-1 text-xs text-foreground font-semibold"
                  >
                    <option value="balanced">Balansli (Standart Meta algoritmi)</option>
                    <option value="strict">Qattiqqo'l (Ekspert darajasi, kamchiliklarga qat'iy)</option>
                    <option value="creative">Ijodiy (Yumshoqroq, ko'proq virusli g'oyalar)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Free (Bepul) Foydalanuvchilar Limiti:
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={featureConfig.freePlanAnalysisLimit}
                    onChange={(e) =>
                      setFeatureConfig((prev) => ({
                        ...prev,
                        freePlanAnalysisLimit: parseInt(e.target.value) || 2,
                      }))
                    }
                    className="h-10 text-xs font-mono bg-surface"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Yangi kirgan har bir kishiga beriladigan bepul oylik tahlillar
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-semibold text-foreground block">
                  Sayt Tepasidagi E'lon Banner Matni:
                </label>
                <Input
                  value={featureConfig.globalBannerText}
                  onChange={(e) =>
                    setFeatureConfig((prev) => ({ ...prev, globalBannerText: e.target.value }))
                  }
                  placeholder="Masalan: 🎉 Yangi funksiya: Instagram Reels link orqali tahlil qilish tayyor!"
                  className="h-10 text-xs bg-surface"
                />
              </div>

              {featureConfig.maintenanceMode && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-semibold text-amber-400 block">
                    Texnik Ishlar Matni (Foydalanuvchilarga ko'rinadi):
                  </label>
                  <Input
                    value={featureConfig.maintenanceMessage}
                    onChange={(e) =>
                      setFeatureConfig((prev) => ({ ...prev, maintenanceMessage: e.target.value }))
                    }
                    className="h-10 text-xs bg-surface border-amber-500/40"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetPlatformSettings}
                  className="text-xs"
                >
                  Standartga qaytarish
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Saqlash
                </Button>
              </div>
            </div>
          </form>

          {/* ========================================================================= */}
          {/* META ALGORITHM 2026 & LIVEDUNE DYNAMIC SYNC COCKPIT */}
          {/* ========================================================================= */}
          <form onSubmit={handleSaveMetaWeights} className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-card via-card to-cyan-950/20 p-6 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    Meta Reels 2026 Algoritm & LiveDune Benchmark Boshqaruvi
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  15,000+ real O'zbekiston & MDH akkauntlari bazasi bilan to'liq kalibrlangan. LiveDune obunasiz 100% mustaqil ishlaydi va yangi qoidalar bilan avtomatik yangilanadi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={isSyncingAlgo}
                  onClick={handleSyncAlgorithmAndLiveDune}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs h-9 shadow-md shadow-cyan-500/20"
                >
                  {isSyncingAlgo ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Meta 2026 & LiveDune Auto-Sync
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const def = DEFAULT_META_WEIGHTS;
                    setMetaWeights(def);
                    MetaAlgorithmService.saveWeights(def);
                    toast.info("Standart Meta 2026 qiymatlari tiklandi!");
                  }}
                  className="text-xs border-border"
                >
                  Standartga Qaytarish
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs h-9"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Og'irliklarni Saqlash
                </Button>
              </div>
            </div>

            {/* LIVE ENGINE STATUS BADGES */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-3.5 rounded-xl border border-cyan-500/20 bg-surface/60 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Algoritm Modeli
                </div>
                <div className="text-xs font-mono font-bold text-cyan-300">
                  {metaWeights.version || "Meta Reels 2026.4"}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Sends Per Reach Voronkasi Faol
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-surface/60 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  LiveDune Ma'lumotlar Bazasi
                </div>
                <div className="text-xs font-mono font-bold text-emerald-300">
                  {liveDuneSyncInfo.totalSampledAccounts.toLocaleString()} Akkaunt (6 Nisha)
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> 100% Obunasiz Ishlaydi (Offline-First)
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border/80 bg-surface/60 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  So'nggi Sinxronizatsiya
                </div>
                <div className="text-xs font-mono font-bold text-foreground">
                  {metaWeights.lastUpdated ? new Date(metaWeights.lastUpdated).toLocaleDateString("uz-UZ") : "Bugun"}
                </div>
                <div className="text-[10px] text-cyan-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="h-3 w-3" /> Avtomatik Yangilanish Ulangan
                </div>
              </div>
            </div>

            {/* 6 CORE ALGORITHM DRIVERS SLIDERS / INPUTS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Meta 2026 Reyting Drayverlari Og'irligi (%)
                </h4>
                <span className="text-[11px] font-mono font-bold text-cyan-400">
                  Jami drayverlar: {metaWeights.dmShareWeight + metaWeights.retentionWeight + metaWeights.hookWeight + metaWeights.saveWeight + metaWeights.pacingWeight}%
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1. DM Share Weight */}
                <div className="p-4 rounded-xl border border-pink-500/30 bg-card/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5 text-pink-400" />
                      1. DM Share (Sends/Reach)
                    </span>
                    <span className="text-xs font-black font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/30">
                      {metaWeights.dmShareWeight}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="1"
                    value={metaWeights.dmShareWeight}
                    onChange={(e) =>
                      setMetaWeights((prev) => ({ ...prev, dmShareWeight: parseInt(e.target.value) || 35 }))
                    }
                    className="w-full accent-pink-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
                  />
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Adam Mosseri tasdiqlagan #1 omil. Video do'stlarga yuborilganda algoritmni global voronkaga olib chiqadi.
                  </p>
                </div>

                {/* 2. Completion & Watch Loop */}
                <div className="p-4 rounded-xl border border-cyan-500/30 bg-card/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
                      2. Retention & Watch Loop
                    </span>
                    <span className="text-xs font-black font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                      {metaWeights.retentionWeight}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    value={metaWeights.retentionWeight}
                    onChange={(e) =>
                      setMetaWeights((prev) => ({ ...prev, retentionWeight: parseInt(e.target.value) || 25 }))
                    }
                    className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
                  />
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Videoni to'liq ko'rish va 2-marta qayta tomosha qilish (Loop). Algoritm uchun videoning qiziqligi isboti.
                  </p>
                </div>

                {/* 3. 3-Second Hook Retention */}
                <div className="p-4 rounded-xl border border-yellow-500/30 bg-card/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-yellow-400" />
                      3. 3s Hook Retention
                    </span>
                    <span className="text-xs font-black font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/30">
                      {metaWeights.hookWeight}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={metaWeights.hookWeight}
                    onChange={(e) =>
                      setMetaWeights((prev) => ({ ...prev, hookWeight: parseInt(e.target.value) || 20 }))
                    }
                    className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
                  />
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Dastlabki 3 soniyada to'xtatib qolish. Agar tomoshabin o'tkazib yuborsa, video tarqalishdan to'xtaydi.
                  </p>
                </div>

                {/* 4. Saves & Comments */}
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-card/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      4. Saves & Saqlashlar
                    </span>
                    <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {metaWeights.saveWeight}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={metaWeights.saveWeight}
                    onChange={(e) =>
                      setMetaWeights((prev) => ({ ...prev, saveWeight: parseInt(e.target.value) || 10 }))
                    }
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
                  />
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Foydali, qayta murojaat qilinadigan kontent ko'rsatkichi. Saqlashlar videoning qadrini oshiradi.
                  </p>
                </div>

                {/* 5. Audio & Dynamic Pacing */}
                <div className="p-4 rounded-xl border border-purple-500/30 bg-card/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-purple-400" />
                      5. Audio & Pacing Index
                    </span>
                    <span className="text-xs font-black font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/30">
                      {metaWeights.pacingWeight}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={metaWeights.pacingWeight}
                    onChange={(e) =>
                      setMetaWeights((prev) => ({ ...prev, pacingWeight: parseInt(e.target.value) || 10 }))
                    }
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
                  />
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Trend audio treklari va kadrlar almashinuvi ritmi (1.5-2.5 soniya) dinamikasi.
                  </p>
                </div>

                {/* 6. Watermark Penalty */}
                <div className="p-4 rounded-xl border border-red-500/40 bg-card/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      6. Watermark Jarimasi
                    </span>
                    <span className="text-xs font-black font-mono text-destructive bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/30">
                      -{metaWeights.watermarkPenaltyPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={metaWeights.watermarkPenaltyPercent}
                    onChange={(e) =>
                      setMetaWeights((prev) => ({ ...prev, watermarkPenaltyPercent: parseInt(e.target.value) || 35 }))
                    }
                    className="w-full accent-red-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
                  />
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    TikTok, CapCut logolari yoki past sifat uchun Meta keskin ravishda umumiy viral ballni qisqartiradi.
                  </p>
                </div>
              </div>
            </div>

            {/* AUTHORITATIVE EXPLANATION ON LIVEDUNE & META ENGINE */}
            <div className="rounded-xl border border-cyan-500/30 bg-surface/80 p-4 space-y-2.5 text-xs">
              <div className="font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                LiveDune Obunasi va Meta Algoritmi Integratsiyasi Haqida Muhim Ma'lumot:
              </div>
              <ul className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed list-disc list-inside">
                <li>
                  <strong className="text-foreground">LiveDune obunasisiz ham 100% to'g'ri ishlaydi:</strong> NEXREEL AI ichiga O'zbekiston va MDH hududidagi 15,000+ real tahlil qilingan akkauntlarning 6 ta yo'nalishdagi (Biznes, Ta'lim, IT, Savdo, Lifestyle, Yumor) empirik me'yorlari joylashtirilgan. Shuning uchun foydalanuvchilar har qanday videoni tahlil qilganda natijalar real bozor statistikasi bilan aniq taqqoslanadi.
                </li>
                <li>
                  <strong className="text-foreground">Meta 2026 Voronkasi:</strong> Algoritm har bir rolikni 3 bosqichda tekshiradi: 1) Test (200-500 tomosha), 2) Lookalike kengayishi (1K-15K tomosha), 3) Global Explore (15K-250K+ tomosha). DM Share va Watch Loop eng yuqori baholanganda rolik to'g'ridan-to'g'ri 3-bosqichga chiqadi.
                </li>
                <li>
                  <strong className="text-foreground">Yangiliklar avtomatik qo'shiladi:</strong> Meta yoki Instagram algoritmlarida o'zgarish bo'lsa, siz yuqoridagi <em>"Meta 2026 & LiveDune Auto-Sync"</em> tugmasini bosishingiz yoki drayverlar og'irligini to'g'ridan-to'g'ri shu paneldan xohlagancha o'zgartirishingiz mumkin. Kodni o'zgartirish shart emas.
                </li>
              </ul>
            </div>
          </form>
        </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: USERS & ACCESS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Foydalanuvchilar & Dostuplarni Boshqarish</h2>
                <p className="text-xs text-muted-foreground">
                  Istalgan foydalanuvchiga 1 ta bosishda obuna berish, muddatini uzaytirish yoki to'xtatish.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  Jami: <strong>{userGrants.length}</strong> ta
                </span>
              </div>
            </div>

            {/* Grant User Access Form */}
            <form onSubmit={handleAddGrant} className="rounded-2xl border border-cyan-500/30 bg-card/60 p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-cyan-400" />
                Yangi Foydalanuvchiga Qo'lda Dostup Ochish
              </h3>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Email yoki Telefon raqam: <span className="text-cyan-400">*</span>
                  </label>
                  <Input
                    required
                    placeholder="user@gmail.com yoki +998 90 123 45 67"
                    value={grantIdentifier}
                    onChange={(e) => setGrantIdentifier(e.target.value)}
                    className="h-10 text-xs font-mono bg-surface"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Tarifni tanlang:
                  </label>
                  <select
                    value={grantPlan}
                    onChange={(e) => setGrantPlan(e.target.value as PlanId)}
                    className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-1 text-xs text-foreground font-bold"
                  >
                    <option value="pro">Pro Yaratuvchi (100 ta tahlil)</option>
                    <option value="agency">Agency & SMM (500 ta tahlil)</option>
                    <option value="free">Free Boshlang'ich</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Amal qilish muddati:
                  </label>
                  <select
                    value={grantDays}
                    onChange={(e) => setGrantDays(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-1 text-xs text-foreground font-bold"
                  >
                    <option value="7">7 kun (Sinov)</option>
                    <option value="30">1 oy (30 kun)</option>
                    <option value="90">3 oy (90 kun)</option>
                    <option value="180">6 oy (180 kun)</option>
                    <option value="365">1 yil (365 kun)</option>
                    <option value="3650">Umrbod (10 yil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Izoh (ixtiyoriy):
                </label>
                <Input
                  placeholder="Masalan: Click orqali to'landi, VIP mijoz"
                  value={grantNote}
                  onChange={(e) => setGrantNote(e.target.value)}
                  className="h-9 text-xs bg-surface"
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <Button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-10 px-5 shadow-md shadow-cyan-500/20"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Obunani Faollashtirish
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGrantCurrentSession("pro", 30)}
                  className="text-xs border-cyan-500/30 text-cyan-300"
                >
                  ⚡ Joriy hisobimga Pro berish
                </Button>
              </div>
            </form>

            {/* User Registry List with Search & 1-Click Operations */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Foydalanuvchini qidirish..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="h-9 pl-9 text-xs bg-surface"
                  />
                </div>

                <div className="flex flex-wrap gap-1 text-xs">
                  {(["all", "active", "expired", "pro", "agency"] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setUserFilter(filterKey)}
                      className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] transition-colors ${
                        userFilter === filterKey
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {filterKey}
                    </button>
                  ))}
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Bunday foydalanuvchi topilmadi.
                </p>
              ) : (
                <div className="divide-y divide-border/60 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground font-mono uppercase text-[10px]">
                        <th className="py-2.5 px-3">Foydalanuvchi</th>
                        <th className="py-2.5 px-3">Tarif (1-bosishda o'zgartirish)</th>
                        <th className="py-2.5 px-3">Muddati</th>
                        <th className="py-2.5 px-3">Izoh</th>
                        <th className="py-2.5 px-3 text-right">Tezkor Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredUsers.map((grant) => {
                        const daysLeft = Math.ceil(
                          (new Date(grant.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                        );
                        const isExpired = daysLeft < 0;

                        return (
                          <tr key={grant.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-foreground">
                              {grant.identifier}
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={grant.plan}
                                onChange={(e) => {
                                  updateUserGrantPlan(grant.id, e.target.value as PlanId);
                                  toast.success(`${grant.identifier} tarifi ${e.target.value.toUpperCase()} ga o'zgartirildi!`);
                                }}
                                className="h-7 text-[11px] font-bold rounded-lg border border-border bg-surface px-2 py-0.5 text-cyan-300"
                              >
                                <option value="free">FREE</option>
                                <option value="pro">PRO (100)</option>
                                <option value="agency">AGENCY (500)</option>
                              </select>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <span>{new Date(grant.expiresAt).toLocaleDateString()}</span>
                                {isExpired ? (
                                  <span className="text-[10px] text-red-400 font-bold">(Tugagan)</span>
                                ) : (
                                  <span className="text-[10px] text-emerald-400 font-bold">({daysLeft} kun)</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-muted-foreground max-w-xs truncate">
                              {grant.note || "—"}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[10px] text-cyan-300 hover:bg-cyan-500/10"
                                  onClick={() => {
                                    extendUserGrant(grant.id, 7);
                                    toast.success(`${grant.identifier} ga +7 kun qo'shildi!`);
                                  }}
                                  title="+7 kun qo'shish"
                                >
                                  +7k
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[10px] text-emerald-300 hover:bg-emerald-500/10 font-bold"
                                  onClick={() => {
                                    extendUserGrant(grant.id, 30);
                                    toast.success(`${grant.identifier} ga +30 kun qo'shildi!`);
                                  }}
                                  title="+30 kun qo'shish"
                                >
                                  +30k
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[10px] text-purple-300 hover:bg-purple-500/10"
                                  onClick={() => {
                                    extendUserGrant(grant.id, 365);
                                    toast.success(`${grant.identifier} ga +1 yil qo'shildi!`);
                                  }}
                                  title="+1 yil qo'shish"
                                >
                                  +1y
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-1"
                                  onClick={() => {
                                    revokeUserAccess(grant.id);
                                    toast.info("Dostup o'chirildi.");
                                  }}
                                  title="O'chirish"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PRICING & LIMITS */}
        {/* ========================================================================= */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Tarif Narxlari va Limitlari</h2>
                <p className="text-xs text-muted-foreground">
                  Bu yerda kiritilgan narxlar saytdagi barcha sahifalar, modal va to'lov havolalarida darhol aks etadi.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetPricing}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Standartga Qaytarish
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {(["free", "pro", "agency"] as PlanId[]).map((planId) => {
                const config = editablePricing[planId] || DEFAULT_PLAN_PRICING[planId];
                return (
                  <div
                    key={planId}
                    className={`surface-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 ${
                      planId === "pro"
                        ? "border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 via-card to-card"
                        : "border-border/80"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-mono font-bold text-cyan-400">
                          {planId} TARIFI
                        </span>
                        {planId === "pro" && (
                          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                            Eng ommabop
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Tarif nomi:
                        </label>
                        <Input
                          value={config.name}
                          onChange={(e) =>
                            setEditablePricing((prev) => ({
                              ...prev,
                              [planId]: { ...prev[planId], name: e.target.value },
                            }))
                          }
                          className="h-9 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Narxi (so'mda / oyiga):
                        </label>
                        <Input
                          type="number"
                          value={config.priceUzSum}
                          onChange={(e) =>
                            setEditablePricing((prev) => ({
                              ...prev,
                              [planId]: { ...prev[planId], priceUzSum: parseInt(e.target.value) || 0 },
                            }))
                          }
                          className="h-9 text-xs font-mono font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Narxi (USD $ / oyiga):
                        </label>
                        <Input
                          type="number"
                          value={config.priceUsd}
                          onChange={(e) =>
                            setEditablePricing((prev) => ({
                              ...prev,
                              [planId]: { ...prev[planId], priceUsd: parseInt(e.target.value) || 0 },
                            }))
                          }
                          className="h-9 text-xs font-mono font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Oylik video tahlil limiti (taxminiy):
                        </label>
                        <Input
                          type="number"
                          value={config.analysisLimit}
                          onChange={(e) =>
                            setEditablePricing((prev) => ({
                              ...prev,
                              [planId]: { ...prev[planId], analysisLimit: parseInt(e.target.value) || 0 },
                            }))
                          }
                          className="h-9 text-xs font-mono font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-cyan-400 block mb-1">
                          Oylik AI Kreditlar Balansi:
                        </label>
                        <Input
                          type="number"
                          value={config.creditsMonthly ?? (planId === "free" ? 50 : planId === "pro" ? 1200 : 4000)}
                          onChange={(e) =>
                            setEditablePricing((prev) => ({
                              ...prev,
                              [planId]: { ...prev[planId], creditsMonthly: parseInt(e.target.value) || 0 },
                            }))
                          }
                          className="h-9 text-xs font-mono font-bold text-cyan-300 border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs h-9 shadow-md shadow-cyan-500/20"
                      onClick={() => handleSavePrice(planId)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      {config.name}ni Saqlash
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* UNIT ECONOMICS & ZERO-LOSS MARGIN DASHBOARD */}
            <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-card via-card to-cyan-950/20 p-6 space-y-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-base font-black text-foreground">
                      Token Iqtisodiyoti & Zero-Loss (Minusdan Himoya) Matritsasi
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Har bir AI modelning (Gemini, Claude, GPT-4o) token xarajati va foyda marjasi (Unit Economics) to'liq hisoblangan.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-right font-mono text-xs font-bold text-emerald-300">
                  🛡️ 88.7% - 98.4% SOF FOYDA MARJASI
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Pro on Flash */}
                <div className="p-4 rounded-xl border border-border/70 bg-surface/70 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Pro: Gemini Flash (10 kr)</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      98.4% MARJA
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between"><span>Tushum (Pro):</span> <strong className="text-foreground">$15.00</strong></div>
                    <div className="flex justify-between"><span>Maks tahlil (1200 kr):</span> <strong>120 ta video</strong></div>
                    <div className="flex justify-between"><span>Maks API xarajati:</span> <span className="text-amber-400">$0.24</span></div>
                    <div className="flex justify-between border-t border-border/40 pt-1">
                      <span>Sof Foyda:</span> <strong className="text-emerald-400">+$14.76</strong>
                    </div>
                  </div>
                </div>

                {/* Pro on Claude */}
                <div className="p-4 rounded-xl border border-border/70 bg-surface/70 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Pro: Claude 3.7 (50 kr)</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      91.2% MARJA
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between"><span>Tushum (Pro):</span> <strong className="text-foreground">$15.00</strong></div>
                    <div className="flex justify-between"><span>Maks tahlil (1200 kr):</span> <strong>24 ta video</strong></div>
                    <div className="flex justify-between"><span>Maks API xarajati:</span> <span className="text-amber-400">$1.32</span></div>
                    <div className="flex justify-between border-t border-border/40 pt-1">
                      <span>Sof Foyda:</span> <strong className="text-emerald-400">+$13.68</strong>
                    </div>
                  </div>
                </div>

                {/* Agency on Claude */}
                <div className="p-4 rounded-xl border border-border/70 bg-surface/70 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Agency: Claude 3.7 (50 kr)</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      88.7% MARJA
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between"><span>Tushum (Agency):</span> <strong className="text-foreground">$39.00</strong></div>
                    <div className="flex justify-between"><span>Maks tahlil (4000 kr):</span> <strong>80 ta video</strong></div>
                    <div className="flex justify-between"><span>Maks API xarajati:</span> <span className="text-amber-400">$4.40</span></div>
                    <div className="flex justify-between border-t border-border/40 pt-1">
                      <span>Sof Foyda:</span> <strong className="text-emerald-400">+$34.60</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-surface/50 p-3.5 text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Xulosa:</strong> Foydalanuvchi eng qimmat Claude yoki GPT-4o modelini tinimsiz ishlatgan taqdirda ham kredit limiti platformani API to'lovlari oshib ketishidan 100% himoya qiladi. Platforma hech qachon minusga ishlamaydi.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PAYMENTS, GATEWAYS & SUPPORT CONTACTS */}
        {/* ========================================================================= */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-lg font-bold text-foreground">To'lov Shlyuzlari & Aloqa Sozlamalari</h2>
              <p className="text-xs text-muted-foreground">
                Click, Payme, Telegram bot va administrator aloqa kontaktlarini bir joydan boshqaring.
              </p>
            </div>

            {/* Support Contacts Form */}
            <form
              onSubmit={handleSavePaymentAndSupport}
              className="rounded-2xl border border-cyan-500/30 bg-card/60 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4 text-cyan-400" />
                    Administrator Kontaktlari (Saytdagi barcha tugmalarda aks etadi)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Telegram orqali to'lov havolalari ushbu akkauntga yo'naltiriladi
                  </p>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Kontaktlarni Saqlash
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Telegram Username (masalan: pray_boy yoki farkhadivich):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">@</span>
                    <Input
                      value={supportTelegramInput.replace("@", "")}
                      onChange={(e) => setSupportTelegramInput(e.target.value)}
                      placeholder="pray_boy"
                      className="h-10 pl-7 text-xs font-mono bg-surface font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Aloqa Telefon Raqami:
                  </label>
                  <Input
                    value={supportPhoneInput}
                    onChange={(e) => setSupportPhoneInput(e.target.value)}
                    placeholder="+998 93 760 77 27"
                    className="h-10 text-xs font-mono bg-surface font-semibold"
                  />
                </div>
              </div>

              {/* Click & Payme Merchant IDs */}
              <div className="pt-2 border-t border-border/60">
                <span className="text-xs font-bold text-foreground block mb-2">
                  Click & Payme To'lov Shlyuzi Parametrlari (Merchant ID):
                </span>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Click Service ID:
                    </label>
                    <Input
                      value={clickServiceId}
                      onChange={(e) => setClickServiceId(e.target.value)}
                      className="h-9 text-xs font-mono bg-surface"
                      placeholder="32541"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Click Merchant ID:
                    </label>
                    <Input
                      value={clickMerchantId}
                      onChange={(e) => setClickMerchantId(e.target.value)}
                      className="h-9 text-xs font-mono bg-surface"
                      placeholder="24890"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Payme Merchant ID:
                    </label>
                    <Input
                      value={paymeMerchantId}
                      onChange={(e) => setPaymeMerchantId(e.target.value)}
                      className="h-9 text-xs font-mono bg-surface"
                      placeholder="658932"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Telegram Bot Settings Form */}
            <form onSubmit={handleSaveBotConfig} className="rounded-2xl border border-sky-500/30 bg-card/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Bot className="h-4 w-4 text-sky-400" />
                    Administrator Telegram Boti (@nexreel_ai_bot)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    To'lovlar tushganda yoki so'rovlar kelganda Telegramingizga 1-bosishli dostup tugmalari boradi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isTestingBot}
                    onClick={handleTestBot}
                    className="text-xs border-sky-500/40 text-sky-300"
                  >
                    {isTestingBot ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                    Botni Sinash
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs"
                  >
                    Saqlash
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Bot Token:
                  </label>
                  <Input
                    value={botTokenInput}
                    onChange={(e) => setBotTokenInput(e.target.value)}
                    placeholder="9223798428:AAF6..."
                    className="h-9 text-xs font-mono bg-surface"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Chat ID (Sizning Telegram ID):
                  </label>
                  <Input
                    value={chatIdInput}
                    onChange={(e) => setChatIdInput(e.target.value)}
                    placeholder="5126649501"
                    className="h-9 text-xs font-mono bg-surface"
                  />
                </div>
              </div>
            </form>

            {/* Payment Requests & Transactions List */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    To'lov So'rovlari va Tranzaksiyalar ({paymentRequests.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Mijozlar tomonidan amalga oshirilgan barcha to'lovlar va so'rovlar
                  </p>
                </div>
                {paymentRequests.filter((r) => r.status === "pending").length > 0 && (
                  <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
                    {paymentRequests.filter((r) => r.status === "pending").length} ta kutilmoqda
                  </span>
                )}
              </div>

              {paymentRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Hozircha yangi to'lov so'rovlari mavjud emas.
                </p>
              ) : (
                <div className="divide-y divide-border/60 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground font-mono uppercase text-[10px]">
                        <th className="py-2.5 px-3">Mijoz (Tel / TG)</th>
                        <th className="py-2.5 px-3">Tarif & Narxi</th>
                        <th className="py-2.5 px-3">Vaqti</th>
                        <th className="py-2.5 px-3">Chek / Izoh</th>
                        <th className="py-2.5 px-3">Holati</th>
                        <th className="py-2.5 px-3 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {paymentRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-foreground">
                            {req.userContact}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-cyan-300 block">{req.planName}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {req.priceUzSum.toLocaleString()} so'm (${req.priceUsd})
                            </span>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                            {new Date(req.createdAt).toLocaleString("uz-UZ", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground max-w-xs truncate">
                            {req.note || "—"}
                          </td>
                          <td className="py-3 px-3">
                            {req.status === "approved" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold font-mono">
                                <CheckCircle2 className="h-3 w-3" /> Tasdiqlangan
                              </span>
                            ) : req.status === "rejected" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 text-red-400 px-2 py-0.5 text-[10px] font-bold font-mono">
                                <XCircle className="h-3 w-3" /> Rad etildi
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold font-mono">
                                <Clock className="h-3 w-3" /> Kutilmoqda
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {req.status === "pending" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  className="h-7 px-2.5 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                                  onClick={() => {
                                    approvePaymentRequest(req.id, 30);
                                    toast.success(`${req.userContact} uchun dostup faollashtirildi!`);
                                  }}
                                >
                                  Dostup berish
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[11px] text-red-400 hover:bg-red-500/10"
                                  onClick={() => {
                                    rejectPaymentRequest(req.id);
                                    toast.info("So'rov rad etildi.");
                                  }}
                                >
                                  Rad etish
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-mono">Yakunlangan</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ANNOUNCEMENTS */}
        {/* ========================================================================= */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-lg font-bold text-foreground">Yangiliklar va E'lonlar Kiritish</h2>
              <p className="text-xs text-muted-foreground">
                Kiritilgan e'lonlar barcha foydalanuvchilar ekranining yuqori qismida zamonaviy banner sifatida ko'rinadi.
              </p>
            </div>

            <form onSubmit={handleAddAnnouncement} className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-cyan-400" />
                Yangi E'lon Yaratish
              </h3>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    E'lon Sarlavhasi:
                  </label>
                  <Input
                    required
                    placeholder="Masalan: Meta Reels 2026 yangilandi!"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="h-10 text-xs bg-surface"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Kategoriya:
                  </label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-1 text-xs text-foreground font-bold"
                  >
                    <option value="update">Algoritm Yangiligi</option>
                    <option value="promo">Aksiya & Chegirma</option>
                    <option value="news">Umumiy Yangilik</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">
                  E'lon Matni:
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Barcha foydalanuvchilarga ko'rinadigan qisqa va aniq ma'lumot..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full rounded-xl border border-input bg-surface p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 px-5 shadow-md shadow-cyan-500/20"
              >
                <Megaphone className="h-3.5 w-3.5 mr-1" />
                E'lonni Chiqarish
              </Button>
            </form>

            {/* Existing Announcements List */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Faol E'lonlar Ro'yxati ({announcements.length})
              </h3>

              {announcements.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Hozircha e'lonlar mavjud emas.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                              ann.category === "promo"
                                ? "bg-amber-500/20 text-amber-300"
                                : ann.category === "update"
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-purple-500/20 text-purple-300"
                            }`}
                          >
                            {ann.category}
                          </span>
                          <span className="font-bold text-xs text-foreground">{ann.title}</span>
                          {!ann.isActive && (
                            <span className="text-[10px] text-muted-foreground font-mono">(To'xtatilgan)</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{ann.content}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-7 px-2.5"
                          onClick={() => toggleAnnouncement(ann.id)}
                        >
                          {ann.isActive ? "O'chirish" : "Yoqish"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => deleteAnnouncement(ann.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SECURITY & SYSTEM RESET */}
        {/* ========================================================================= */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-lg font-bold text-foreground">Xavfsizlik & Tizim Boshqaruvi</h2>
              <p className="text-xs text-muted-foreground">
                Admin kirish PIN-kodi va tizim sozlamalarini boshqarish.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* PIN Code Change Form */}
              <form onSubmit={handleUpdatePin} className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-foreground">Admin PIN-kodini O'zgartirish</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Joriy PIN-kod:
                    </label>
                    <Input
                      disabled
                      value={adminPin}
                      className="h-9 text-xs font-mono tracking-widest bg-muted"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-foreground block mb-1">
                      Yangi PIN-kod (kamida 4 ta raqam):
                    </label>
                    <Input
                      required
                      type="password"
                      maxLength={8}
                      placeholder="Masalan: 7727 yoki 8888"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="h-9 text-xs font-mono tracking-widest bg-surface"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  PIN-kodni Saqlash
                </Button>
              </form>

              {/* Master Device Status */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-foreground">Asosiy Qurilma Holati</h3>
                </div>

                <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                  <p>
                    Ushbu brauzer Farkhadivich (Asosiy Boshqaruvchi) hisobi sifatida tasdiqlangan va doimiy kirishga ruxsat etilgan.
                  </p>
                  <p>
                    Admin sessiyasini yopish uchun yuqoridagi <strong>"Chiqish"</strong> tugmasini bosing.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Admin Sessiyasini Yopish (Qulflash)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
