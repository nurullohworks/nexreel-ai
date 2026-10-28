import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Send, Phone, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";
import type { PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/app/PaymentModal";
import { TELEGRAM_PAYMENT } from "@/lib/services/payment";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Tariflar & Narxlar — NEXREEL AI" },
      {
        name: "description",
        content:
          "Instagram samaradorlik tahlili uchun qulay narxlar: Bepul, Pro — 190,000 so'm/oy va Agency — 490,000 so'm/oy.",
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
    name: "Bepul",
    monthlyUzSum: 0,
    monthlyUsd: 0,
    cta: "Bepul Boshlash",
    features: ["Oyiga 2 ta tahlil", "Asosiy hisobot", "Asosiy hisob tahlili", "Cheklangan tarix"],
  },
  {
    id: "pro",
    name: "Pro Yaratuvchi",
    monthlyUzSum: 190000,
    monthlyUsd: 15,
    cta: "Pro'ga O'tish",
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
    name: "Agency & SMM",
    monthlyUzSum: 490000,
    monthlyUsd: 39,
    cta: "Agency'ni Boshlash",
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

function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");
  const { user, setPlan, pricingConfig } = useAppStore();
  const navigate = useNavigate();

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
            <h1 className="text-4xl font-semibold md:text-5xl">Natija uchun mo'ljallangan narxlar.</h1>
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
              Har bir tarif to'liq bashorat tizimini o'z ichiga oladi. To'lov to'g'ridan-to'g'ri Telegram orqali (@{TELEGRAM_PAYMENT.username}, {TELEGRAM_PAYMENT.displayPhone}) Click, Payme va kartalar bilan tezkor qabul qilinadi.
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
                <ShieldCheck className="h-3 w-3" /> 5 daqiqada faollashtirish
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
                    <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-widest text-primary-foreground font-bold">
                      Eng ommabop
                    </span>
                  ) : null}
                  <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">
                    {planName}
                  </h2>
                  <div className="mt-4 flex flex-col">
                    {plan.id === "free" ? (
                      <span className="text-4xl font-bold">Bepul</span>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold">{priceSum.toLocaleString()} so'm</span>
                          <span className="text-xs text-muted-foreground">/oy</span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-0.5">yoki ${priceUsd}/oy</span>
                      </>
                    )}
                  </div>
                  {yearly && basePriceUzSum > 0 ? (
                    <p className="mt-1 text-xs text-primary">
                      Yillik to'lovda 20% chegirma beriladi
                    </p>
                  ) : null}
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    <li className="flex items-start gap-2 text-foreground/85 font-semibold text-cyan-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                      Oyiga {planLimit} ta video tahlili
                    </li>
                    {plan.features.slice(1).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-foreground/85">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-7 font-bold"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => choose(plan.id)}
                  >
                    {plan.cta}
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground space-y-1">
            <p>
              Bashoratlar Meta algoritmining 5 ta drayveri va LiveDune benchmarklari asosida beriladi.
            </p>
            <p>
              To'lovlar to'g'ridan-to'g'ri administrator Telegramiga (
              <a href={TELEGRAM_PAYMENT.telegramUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">
                @{TELEGRAM_PAYMENT.username}
              </a>
              , tel:{" "}
              <a href={`tel:${TELEGRAM_PAYMENT.phone}`} className="text-foreground underline font-mono">
                {TELEGRAM_PAYMENT.displayPhone}
              </a>
              ) qabul qilinadi. Click, Payme va kartalar orqali qulay to'lov.
            </p>
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
