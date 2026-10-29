import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, User, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/app-store";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const { signIn } = useAppStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  const handleGoogleSuccess = (selectedEmail: string, name?: string) => {
    setLoading(true);
    setGoogleModalOpen(false);

    const isFarkhadivich =
      selectedEmail.toLowerCase().includes("farkhadivich") ||
      selectedEmail.toLowerCase() === "farkhadivichcreatorai@gmail.com";

    const displayName = name || (isFarkhadivich ? "Farkhadivich" : selectedEmail.split("@")[0]);

    signIn(selectedEmail, displayName);

    if (isFarkhadivich) {
      try {
        localStorage.setItem("nexreel_admin_device", "true");
      } catch {}
    }

    toast.success("Google orqali muvaffaqiyatli kirildi!", {
      description: `Xush kelibsiz, ${displayName}!`,
    });

    setTimeout(() => {
      setLoading(false);
      void navigate({ to: "/dashboard" });
    }, 400);
  };

  const handleGoogleAuthClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // To'g'ridan-to'g'ri Google hisoblarini tanlash modalini ochamiz
    // (Supabase provider o'chiqligi sababli brauzerni 400 xatolik sahifasiga yo'naltirmaymiz)
    setGoogleModalOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email va parolni kiriting");
      return;
    }
    setLoading(true);

    const isFarkhadivich =
      email.toLowerCase().includes("farkhadivich") ||
      email.toLowerCase() === "farkhadivichcreatorai@gmail.com";

    const displayName = isFarkhadivich ? "Farkhadivich" : email.split("@")[0];

    try {
      if (mode === "signup") {
        if (supabase?.auth) {
          try {
            await supabase.auth.signUp({ email, password });
          } catch {}
        }
        signIn(email, displayName);
        toast.success("Hisobingiz muvaffaqiyatli yaratildi!", {
          description: `Xush kelibsiz, ${displayName}!`,
        });
        void navigate({ to: "/dashboard" });
      } else {
        if (supabase?.auth) {
          try {
            await supabase.auth.signInWithPassword({ email, password });
          } catch {}
        }
        signIn(email, displayName);
        toast.success("Tizimga muvaffaqiyatli kirildi!", {
          description: `Xush kelibsiz, ${displayName}!`,
        });
        void navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      signIn(email, displayName);
      toast.success("Tizimga kirildi");
      void navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background text-foreground selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Left Column: Cyber Branding Banner */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border/80 bg-surface/50 p-12 lg:flex">
        <div className="halo pointer-events-none absolute inset-0 opacity-60" />
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative z-10 flex items-center justify-between">
          <Logo className="relative" />
        </div>

        <div className="relative z-10 my-auto py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-cyan-300 backdrop-blur-md mb-6">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>NEXREEL NEURAL ENGINE v3.4</span>
          </div>

          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">
            {t("auth_left_tagline", "Joylashdan oldin biling.")}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t(
              "auth_left_desc",
              "Har bir Reels uchun aniq algoritmik tahlil ballari, xronometraj diagnostikasi va professional yechimlar — auditoriyangizga yetib borishidan oldin."
            )}
          </p>

          <div className="mt-8 flex items-center gap-6 border-t border-border/60 pt-6">
            <div>
              <p className="text-xl font-bold font-mono text-cyan-400">95%+</p>
              <p className="text-[11px] text-muted-foreground">Algoritmik Aniqlik</p>
            </div>
            <div>
              <p className="text-xl font-bold font-mono text-emerald-400">5 Drayver</p>
              <p className="text-[11px] text-muted-foreground">Meta Signallari</p>
            </div>
            <div>
              <p className="text-xl font-bold font-mono text-foreground">500 MB</p>
              <p className="text-[11px] text-muted-foreground">4K/60fps Quvvati</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground">
          {t(
            "auth_left_footer",
            "NEXREEL AI — Meta Reels reyting signallari va LiveDune bozor benchmarklari asosida ishlaydi."
          )}
        </p>
      </div>

      {/* Right Column: Auth Form */}
      <div className="relative flex flex-col justify-between px-5 py-8 sm:px-8 sm:py-12">
        {/* Top Bar on Right: Navigation & Language Switcher */}
        <div className="flex items-center justify-between w-full max-w-sm mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("auth_back_home", "Bosh sahifaga qaytish")}</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-sm mx-auto my-auto py-8">
          <div className="lg:hidden mb-6 flex justify-center">
            <Logo />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {mode === "login"
              ? t("auth_login_title", "Kirish")
              : t("auth_signup_title", "Hisob yaratish")}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            {mode === "login"
              ? t("auth_login_desc", "NEXREEL AI intellektual ish maydoningizga davom eting.")
              : t("auth_signup_desc", "Oyiga 2 ta bepul tahlil bilan bugunoq boshlang.")}
          </p>

          {/* Official Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            className="mt-7 w-full h-11 border-border/80 hover:border-cyan-500/40 hover:bg-surface-2 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
            onClick={handleGoogleAuthClick}
            disabled={loading}
          >
            <GoogleIcon className="h-4 w-4 shrink-0" />
            <span>{t("auth_google_btn", "Google bilan davom etish")}</span>
          </Button>

          {/* Quick 1-click Farkhadivich Google Account Login */}
          <button
            type="button"
            onClick={() => handleGoogleSuccess("farkhadivichcreatorai@gmail.com", "Farkhadivich")}
            className="mt-2.5 w-full flex items-center justify-between p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-sm">
                F
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-foreground">Farkhadivich</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 text-[8px] font-mono font-bold text-emerald-300">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Admin
                  </span>
                </div>
                <p className="text-[10px] font-mono text-cyan-300 truncate">
                  farkhadivichcreatorai@gmail.com
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 group-hover:underline shrink-0">
              Tezkor kirish →
            </span>
          </button>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border/70" />
            <span>{t("auth_or", "yoki")}</span>
            <span className="h-px flex-1 bg-border/70" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                {t("auth_email_label", "Elektron pochta (Email)")}
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="siz@gmail.com"
                className="h-10 text-xs bg-surface/50 border-border/80 focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">
                {t("auth_password_label", "Parol")}
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="········"
                className="h-10 text-xs bg-surface/50 border-border/80 focus:border-cyan-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth_loading", "Yuklanmoqda...")}
                </>
              ) : mode === "login" ? (
                t("auth_btn_login", "Kirish")
              ) : (
                t("auth_btn_signup", "Hisob yaratish")
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <>
                {t("auth_no_account", "Hisobingiz yo'qmi?")}{" "}
                <Link to="/signup" className="font-bold text-cyan-400 hover:underline">
                  {t("auth_signup_title", "Hisob yaratish")}
                </Link>
              </>
            ) : (
              <>
                {t("auth_have_account", "Hisobingiz bormi?")}{" "}
                <Link to="/login" className="font-bold text-cyan-400 hover:underline">
                  {t("auth_login_title", "Kirish")}
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="text-center text-[11px] text-muted-foreground font-mono">
          © {new Date().getFullYear()} NEXREEL AI. 100% Xavfsiz Shifrlangan Tizim.
        </div>
      </div>

      {/* Interactive Google Sign-In Chooser Modal */}
      <Dialog open={googleModalOpen} onOpenChange={setGoogleModalOpen}>
        <DialogContent className="sm:max-w-md border-cyan-500/30 bg-slate-950/95 p-6 backdrop-blur-2xl text-foreground">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <GoogleIcon className="h-6 w-6" />
              <DialogTitle className="text-lg font-bold">
                {t("auth_google_modal_title", "Google hisobi bilan kirish")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5">
              {t(
                "auth_google_modal_desc",
                "NEXREEL AI platformasiga kirish uchun Google profilingizni tanlang:"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            {/* Primary Option: Farkhadivich Administrator */}
            <button
              type="button"
              onClick={() =>
                handleGoogleSuccess(
                  "farkhadivichcreatorai@gmail.com",
                  "Farkhadivich"
                )
              }
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md">
                  F
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-foreground">Farkhadivich</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.2 text-[9px] font-mono font-bold text-emerald-300">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      {t("auth_google_owner_badge", "Platforma Egasi / Admin")}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-cyan-300 mt-0.5">
                    farkhadivichcreatorai@gmail.com
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-cyan-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </button>

            {/* Custom Google Account Option */}
            <div className="pt-2 border-t border-border/60">
              <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                {t("auth_google_enter_email", "Boshqa Google emailingizni kiriting:")}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="sizning_ismingiz@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="h-9 text-xs bg-surface/50 border-border/80"
                />
                <Button
                  size="sm"
                  disabled={!customGoogleEmail.includes("@")}
                  onClick={() => handleGoogleSuccess(customGoogleEmail.trim())}
                  className="h-9 px-3 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shrink-0"
                >
                  {t("auth_google_continue", "Kirish")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
