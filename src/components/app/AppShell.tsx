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

const nav = [
  { to: "/analyze", label: "Tahlil qilish", icon: Upload, highlight: true },
  { to: "/dashboard", label: "Boshqaruv", icon: LayoutDashboard },
  { to: "/accounts", label: "Akkauntlar", icon: BarChart3 },
  { to: "/reports", label: "Hisobotlar", icon: FileText },
  { to: "/history", label: "Tarix", icon: History },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const {
    user,
    signIn,
    signOut,
    subscription,
    hydrated,
    daysUntilExpiry,
    isExpiringSoon,
    isExpired,
    announcements,
  } = useAppStore();
  const navigate = useNavigate();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Agar foydalanuvchi bir marta kirsa yoki sessiya bo'lsa, uni to'xtatmaymiz - doimiy ochiq turadi
  useEffect(() => {
    if (hydrated && !user) {
      signIn("creator@nexreel.ai", "Creator");
    }
  }, [hydrated, user, signIn]);

  const activeAnnouncement = announcements?.find((a) => a.isActive);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Subscription Expiry Warning Banner */}
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

          <div className="flex items-center gap-2.5">
            <Link
              to="/pricing"
              className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-mono font-bold text-cyan-300 transition-all hover:bg-cyan-500/20"
            >
              <Zap className="h-3 w-3 text-cyan-400" />
              <span className="uppercase">{subscription.plan}</span>
              <span className="opacity-70">({subscription.usedThisMonth}/{subscription.monthlyLimit})</span>
            </Link>

            {/* Admin Console Link */}
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
        <div className="grid grid-cols-6 py-1">
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
          <Link
            to="/admin"
            className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-cyan-400"
            activeProps={{ className: "text-cyan-400 font-bold" }}
          >
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Admin
          </Link>
        </div>
      </nav>
    </div>
  );
}
