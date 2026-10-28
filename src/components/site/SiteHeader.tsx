import { Link } from "@tanstack/react-router";
import { Sparkles, Upload, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function SiteHeader() {
  const { user, hydrated } = useAppStore();
  const { t } = useI18n();

  const links = [
    { to: "/analyze", label: t("nav_analyze", "Tahlil qilish"), icon: Upload },
    { to: "/pricing", label: t("nav_pricing", "Tariflar") },
    { to: "/accounts", label: t("nav_accounts", "Instagram Akkaunt") },
  ] as const;

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

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-xs font-semibold text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-cyan-400">
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="text-cyan-400 transition-colors hover:text-cyan-300 font-bold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("nav_admin", "Admin")}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sleek, compact 3-language switcher */}
          <LanguageSwitcher />

          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold h-8 px-2.5">
              <Link to="/admin">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
                {t("nav_admin", "Admin")}
              </Link>
            </Button>
          )}
          {hydrated && user ? (
            <Button asChild size="sm" className="shadow-lg shadow-cyan-500/20 font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 h-8 text-xs px-3">
              <Link to="/analyze">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {t("nav_panel_btn", "Tahlil Paneli")}
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex h-8">
                <Link to="/login">{t("nav_login", "Kirish")}</Link>
              </Button>
              <Button asChild size="sm" className="shadow-lg shadow-cyan-500/20 font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 text-slate-950 text-xs h-8 px-3">
                <Link to="/signup">{t("nav_signup", "Bepul Boshlash")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
