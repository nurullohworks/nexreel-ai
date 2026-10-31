import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Upload,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Send,
  X,
  Megaphone,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";
import { TELEGRAM_PAYMENT } from "@/lib/services/payment";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function AppShell({ children }: { children: ReactNode }) {
  const {
    user,
    signIn,
    signOut,
    subscription,
    creditsRemaining,
    hydrated,
    daysUntilExpiry,
    isExpiringSoon,
    isExpired,
    announcements,
    platformSettings,
  } = useAppStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [globalBannerDismissed, setGlobalBannerDismissed] = useState(false);

  const isAdmin =
    (typeof window !== "undefined" &&
      (window.localStorage.getItem("nexreel_admin_device") === "true" ||
       window.localStorage.getItem("nexreel_admin_unlocked") === "true")) ||
    Boolean(
      user?.email &&
        (user.email.toLowerCase().includes("farkhadivich") ||
         user.email.toLowerCase() === "farkhadivichcreatorai@gmail.com" ||
         user.email.toLowerCase().includes("pray_boy") ||
         user.email.includes("7727") ||
         user.email === "admin@nexreel.ai")
    );

  const nav = [
    { to: "/analyze", label: t("nav_analyze", "Tahlil qilish"), icon: Upload, highlight: true },
    { to: "/dashboard", label: t("nav_dashboard", "Boshqaruv"), icon: LayoutDashboard },
    { to: "/accounts", label: t("nav_accounts", "Akkauntlar"), icon: BarChart3 },
    { to: "/reports", label: t("nav_reports", "Hisobotlar"), icon: FileText },
    { to: "/history", label: t("nav_history", "Tarix"), icon: History },
    ...(isAdmin ? [{ to: "/admin", label: t("nav_admin_panel", "Admin Panel"), icon: ShieldCheck, highlight: false }] : []),
  ];

  // Foydalanuvchi sessiyasini saqlash: agar admin qurilmasi bo'lsa, avtomatik Farkhadivich, aks holda yangi creator
  useEffect(() => {
    if (hydrated && !user) {
      const isOwnerDevice =
        typeof window !== "undefined" &&
        window.localStorage.getItem("nexreel_admin_device") === "true";
      if (isOwnerDevice) {
        signIn("farkhadivichcreatorai@gmail.com", "Farkhadivich");
      } else {
        signIn("creator@nexreel.ai", "Yangi Yaratuvchi");
      }
    }
  }, [hydrated, user, signIn]);

  const activeAnnouncement = announcements?.find((a) => a.isActive);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 0. Maintenance Mode Banner (Admin yoqqanda) */}
      {platformSettings?.maintenanceMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
          <span>
            {platformSettings.maintenanceMessage ||
              "NEXREEL AI platformasida rejaviy yangilanish ketmoqda. Ayrim funksiyalar vaqtincha cheklangan bo'lishi mumkin."}
          </span>
        </div>
      )}

      {/* 1. Global Announcement / Feature Launch Banner */}
      {platformSettings?.showGlobalBanner && platformSettings?.globalBannerText && !globalBannerDismissed && (
        <div className="bg-gradient-to-r from-cyan-600/90 via-blue-600/90 to-purple-600/90 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 max-w-6xl mx-auto flex-1">
            <Zap className="h-3.5 w-3.5 text-yellow-300 shrink-0 animate-bounce" />
            <span className="truncate">{platformSettings.globalBannerText}</span>
          </div>
          <button
            onClick={() => setGlobalBannerDismissed(true)}
            className="p-1 rounded text-white/80 hover:text-white shrink-0"
            aria-label="Yopish"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* 2. Subscription Expiry Warning Banner */}
      {(isExpiringSoon || isExpired) && subscription.plan !== "free" && (
        <div
          className={`px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 ${
            isExpired
              ? "bg-gradient-to-r from-red-600 to-rose-700 text-white"
              : "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white"
          }`}
        >
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce" />
            <span>
              {isExpired ? (
                <>
                  <strong>Obuna muddati tugadi:</strong> Sizning{" "}
                  <span className="uppercase underline font-bold">{subscription.plan}</span> tarifingiz muddati tugadi.
                  Tahlillarni cheklovsiz davom ettirish uchun obunani yangilang!
                </>
              ) : (
                <>
                  <strong>Obuna ogohlantirishi:</strong> Sizning{" "}
                  <span className="uppercase underline font-bold">{subscription.plan}</span> tarifingiz tugashiga{" "}
                  <span className="font-extrabold underline">
                    {daysUntilExpiry === 0 ? "bugun oxirgi kun" : `${daysUntilExpiry} kun`}
                  </span>{" "}
                  qoldi!
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={TELEGRAM_PAYMENT.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 hover:bg-black/60 px-3 py-1 text-[11px] font-bold text-white transition-all shadow-sm"
            >
              <Send className="h-3 w-3" />
              <span>Uzaytirish (@{TELEGRAM_PAYMENT.username})</span>
            </a>
          </div>
        </div>
      )}

      {/* 2. Admin Announcements Top Bar */}
      {activeAnnouncement && !announcementDismissed && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-blue-950/80 to-purple-950/90 border-b border-cyan-500/30 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Megaphone className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 font-mono shrink-0">
                {activeAnnouncement.category === "promo"
                  ? "Aksiya"
                  : activeAnnouncement.category === "update"
                  ? "Algoritm"
                  : "E'lon"}
              </span>
              <span className="font-bold text-foreground truncate">{activeAnnouncement.title}:</span>
              <span className="text-muted-foreground truncate hidden sm:inline">
                {activeAnnouncement.content}
              </span>
            </div>
            <button
              onClick={() => setAnnouncementDismissed(true)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Yopish"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1.5 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative rounded-xl px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-surface-2 hover:text-foreground"
                  activeProps={{ className: "bg-surface-2 text-cyan-400 font-bold shadow-sm ring-1 ring-cyan-500/20" }}
                >
                  <span className="flex items-center gap-1.5">
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Sleek, compact 3-language switcher */}
            <LanguageSwitcher />

            <Link
              to="/billing"
              className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-mono font-bold text-cyan-300 transition-all hover:bg-cyan-500/20"
              title="AI Kreditlar balansi va tarif boshqaruvi"
            >
              <Zap className="h-3 w-3 text-cyan-400" />
              <span className="uppercase">{subscription.plan}</span>
              <span className="text-white font-black bg-cyan-500/30 px-1.5 py-0.5 rounded-md text-[10px]">
                {(creditsRemaining ?? 4000).toLocaleString()} KREDIT
              </span>
            </Link>

            {/* Admin Console Link (Only for Admin) */}
            {isAdmin && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-[11px] font-mono font-bold text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30"
              >
                <Link to="/admin" aria-label="Admin Panel">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 text-cyan-400" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}

            <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-surface-2">
              <Link to="/pricing" aria-label="Tariflar">
                <CreditCard className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-surface-2">
              <Link to="/settings" aria-label="Sozlamalar">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
              aria-label="Chiqish"
              onClick={() => {
                signOut();
                void navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 pb-28 pt-8 lg:pb-16">{children}</main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-xl md:hidden">
        <div className={`grid ${isAdmin ? "grid-cols-6" : "grid-cols-5"} py-1`}>
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-cyan-400 font-bold" }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-cyan-400"
              activeProps={{ className: "text-cyan-400 font-bold" }}
            >
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              Admin
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
