import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, Send, Phone, ShieldCheck, KeyRound, Sparkles, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/app-store";
import type { PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/app/PaymentModal";
import { TELEGRAM_PAYMENT } from "@/lib/services/payment";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Tariflar & Narxlar — NEXREEL AI" },
      {
        name: "description",
        content: "Instagram samaradorlik tahlili uchun qulay narxlar: Bepul, Pro va Agency.",
      },
      { property: "og:title", content: "NEXREEL AI Tariflari" },
      {
        property: "og:description",
        content: "AI asosidagi Reels samaradorligini bashorat qilish uchun Bepul, Pro va Agency tariflari.",
      },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");
  const [promoInput, setPromoInput] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  const { user, setPlan, pricingConfig, activateCode, activateGrantToken } = useAppStore();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Telegram bot orqali 1-bosishda yuborilgan dostup havolasini avtomatik faollashtirish
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const grantToken = params.get("grant") || params.get("grant_token");
    const code = params.get("code") || params.get("activation_code");

    if (grantToken) {
      const res = activateGrantToken(grantToken);
      if (res.success) {
        toast.success(res.message, {
          description: "Telegram orqali 1-bosishda dostup muvaffaqiyatli taqdim etildi!",
          duration: 6000,
        });
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      } else {
        toast.error(res.message);
      }
    } else if (code) {
      const res = activateCode(code);
      if (res.success) {
        toast.success(res.message, {
          description: "Aktivatsiya kodingiz muvaffaqiyatli qabul qilindi!",
          duration: 6000,
        });
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      } else {
        toast.error(res.message);
      }
    }
  }, [activateCode, activateGrantToken]);

  const handleManualActivate = () => {
    if (!promoInput.trim()) {
      toast.error("Iltimos, faollashtirish kodini kiriting!");
      return;
    }
    setIsActivating(true);
    const res = activateCode(promoInput.trim());
    if (res.success) {
      toast.success(res.message, {
        description: "Hisobingiz muvaffaqiyatli yangilandi!",
        duration: 5000,
      });
      setPromoInput("");
      setTimeout(() => {
        void navigate({ to: "/dashboard" });
      }, 800);
    } else {
      toast.error(res.message);
    }
    setIsActivating(false);
  };

  const plans: {
    id: PlanId;
    name: string;
    monthlyUzSum: number;
    monthlyUsd: number;
    features: string[];
    cta: string;
    popular?: boolean;
  }[] = [
    {
      id: "free",
      name: t("pricing_plan_free", "Bepul"),
      monthlyUzSum: 0,
      monthlyUsd: 0,
      cta: t("pricing_cta_free", "Bepul Boshlash"),
      features: ["Oyiga 2 ta tahlil", "Asosiy hisobot", "Asosiy hisob tahlili", "Cheklangan tarix"],
    },
    {
      id: "pro",
      name: t("pricing_plan_pro", "Pro Yaratuvchi"),
      monthlyUzSum: 190000,
      monthlyUsd: 15,
      cta: t("pricing_cta_pro", "Pro'ga O'tish"),
      popular: true,
      features: [
        "100 ta video tahlili",
        "Ilg'or Gemini / Claude AI tahlili",
        "Meta 5 drayverli diagnostika",
        "LiveDune sohaviy benchmarklari",
        "Batafsil timeline tavsiyalari",
        "Tahlil tarixi va solishtirish",
        "Ustuvor qayta ishlash",
      ],
    },
    {
      id: "agency",
      name: t("pricing_plan_agency", "Agency & SMM"),
      monthlyUzSum: 490000,
      monthlyUsd: 39,
      cta: t("pricing_cta_agency", "Agency'ni Boshlash"),
      features: [
        "500 ta video tahlili",
        "Bir nechta Instagram hisoblari",
        "Jamoaviy kirish imkoniyati",
        "Mijozlar uchun PDF hisobotlar",
        "Oq nishonli (White-label) brending",
        "VIP texnik yordam",
      ],
    },
  ];

  const choose = (id: PlanId) => {
    if (id === "free") {
      setPlan("free");
      void navigate({ to: "/billing" });
      return;
    }
    setSelectedPlan(id);
    setPaymentOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h1 className="text-4xl font-semibold md:text-5xl">{t("pricing_title", "Tariflar & Narxlar")}</h1>
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
              {t("pricing_desc", "Instagram Reels auditoriyasi va qamrovini kengaytirish uchun professional vositalar.")}
            </p>

            {/* Telegram Fast Banner */}
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-5 py-2.5 text-xs text-sky-200">
              <span className="flex items-center gap-1.5 font-bold text-sky-400">
                <Send className="h-3.5 w-3.5" /> Telegram orqali to'lov:
              </span>
              <a
                href={TELEGRAM_PAYMENT.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-bold text-cyan-300 hover:underline"
              >
                @{TELEGRAM_PAYMENT.username}
              </a>
              <span className="text-sky-500/60 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-muted-foreground font-mono">
                <Phone className="h-3 w-3 text-emerald-400" />
                <a href={`tel:${TELEGRAM_PAYMENT.phone}`} className="hover:underline text-foreground">
                  {TELEGRAM_PAYMENT.displayPhone}
                </a>
              </span>
              <span className="text-sky-500/60 hidden sm:inline">•</span>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Telegram botda 1-bosishda dostup berish
              </span>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-sm">
                <button
                  onClick={() => setYearly(false)}
                  className={cn(
                    "rounded-full px-4 py-1.5 transition-colors",
                    !yearly ? "bg-muted text-foreground" : "text-muted-foreground",
                  )}
                >
                  Oylik
                </button>
                <button
                  onClick={() => setYearly(true)}
                  className={cn(
                    "rounded-full px-4 py-1.5 transition-colors",
                    yearly ? "bg-muted text-foreground" : "text-muted-foreground",
                  )}
                >
                  Yillik · 20% tejang
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const dyn = pricingConfig[plan.id];
              const basePriceUzSum = dyn ? dyn.priceUzSum : plan.monthlyUzSum;
              const basePriceUsd = dyn ? dyn.priceUsd : plan.monthlyUsd;
              const planLimit = dyn ? dyn.analysisLimit : (plan.id === "free" ? 2 : plan.id === "pro" ? 100 : 500);
              const planName = dyn ? dyn.name : plan.name;

              const priceSum = yearly ? Math.round(basePriceUzSum * 0.8) : basePriceUzSum;
              const priceUsd = yearly ? Math.round(basePriceUsd * 0.8) : basePriceUsd;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "surface-card relative flex flex-col p-7",
                    plan.popular && "border-primary/50 shadow-[var(--shadow-glow)]",
                  )}
                >
                  {plan.popular ? (
                    <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                      {t("pricing_popular_badge", "ENG KO'P TANLANGAN")}
                    </span>
                  ) : null}

                  <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-semibold">{planName}</h2>
                    <span className="text-xs text-muted-foreground font-mono">{planLimit} ta tahlil/oy</span>
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight">
                      {priceSum === 0 ? "Bepul" : `${priceSum.toLocaleString()} so'm`}
                    </span>
                    {priceSum > 0 && (
                      <span className="text-xs text-muted-foreground">/{t("pricing_month_unit", "oy")}</span>
                    )}
                  </div>
                  {priceUsd > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground font-mono">yoki ~${priceUsd} / oy</p>
                  )}

                  <ul className="mt-7 space-y-3 text-xs flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => choose(plan.id)}
                    className={cn(
                      "mt-8 w-full font-bold",
                      plan.popular && "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950",
                    )}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Quick Activation Code Card */}
          <div className="mt-12 max-w-xl mx-auto p-6 rounded-2xl border border-cyan-500/30 bg-surface/60 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Aktivatsiya kodingiz bormi?
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Telegram orqali to'lov qilganingizda berilgan faollashtirish kodini kiriting:
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Masalan: PRO-30D-XXXXXX yoki NEX-PRO-7727"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                className="h-10 text-xs font-mono uppercase bg-background/80 border-border/80 focus:border-cyan-400"
              />
              <Button
                disabled={!promoInput.trim() || isActivating}
                onClick={handleManualActivate}
                className="h-10 px-5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shrink-0 shadow-md shadow-cyan-500/20"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Tekshirilmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Faollashtirish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}
