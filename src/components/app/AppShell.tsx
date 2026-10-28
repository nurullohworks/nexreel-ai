import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
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
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";

const nav = [
  { to: "/analyze", label: "Tahlil qilish", icon: Upload, highlight: true },
  { to: "/dashboard", label: "Boshqaruv", icon: LayoutDashboard },
  { to: "/accounts", label: "Akkauntlar", icon: BarChart3 },
  { to: "/reports", label: "Hisobotlar", icon: FileText },
  { to: "/history", label: "Tarix", icon: History },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut, subscription, hydrated } = useAppStore();
  const navigate = useNavigate();

  if (hydrated && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 bg-background">
        <div className="surface-card max-w-sm p-8 text-center border border-border/80 shadow-2xl rounded-2xl">
          <Logo className="justify-center" />
          <h1 className="mt-6 text-xl font-bold tracking-tight text-foreground">Xush kelibsiz!</h1>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Reels videolaringizni tahlil qilish va hisobotlarni ko‘rish uchun tizimga kiring.
          </p>
          <Button asChild className="mt-6 w-full shadow-lg shadow-cyan-500/20 font-semibold">
            <Link to="/login">Tizimga kirish</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-cyan-500/30 selection:text-cyan-200">
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
        <div className="grid grid-cols-5 py-1">
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
        </div>
      </nav>
    </div>
  );
}
