import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Send, Phone, ShieldCheck, KeyRound, Sparkles, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { StatCard } from "@/components/data/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/app-store";
import { PaymentModal } from "@/components/app/PaymentModal";
import { TELEGRAM_PAYMENT } from "@/lib/services/payment";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Hisob-kitob — NEXREEL AI" },
      { name: "description", content: "NEXREEL AI tarifingiz, foydalanishingiz va yangilanishingizni boshqaring." },
      { property: "og:title", content: "Hisob-kitob — NEXREEL AI" },
      { property: "og:description", content: "Joriy tarif, shu oydagi foydalanish va obuna boshqaruvi." },
    ],
  }),
  component: Billing,
});

function Billing() {
  const {
    subscription,
    user,
    setPlan,
    cancelSubscription,
    activateCode,
    activateGrantToken,
    recordAutoPayment,
  } = useAppStore();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  const remaining = Math.max(0, subscription.monthlyLimit - subscription.usedThisMonth);

  // Click / Payme avtomatik to'lov va Telegram 1-bosishda dostup havolalarini qayta ishlash
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const provider = (params.get("provider") || "click").toLowerCase();
    const planParam = ((params.get("plan") as any) || "pro");
    const txId = params.get("tx") || `TX-${provider.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const grantToken = params.get("grant") || params.get("grant_token");
    const code = params.get("code") || params.get("activation_code");

    if (paymentStatus === "success") {
      void recordAutoPayment({
        planId: planParam,
        provider: provider as any,
        userContact: user?.email || "avto_tolov_mijoz",
        transactionId: txId,
        days: 30,
        note: `${provider.toUpperCase()} orqali avtomatik to'landi. Tranzaksiya: ${txId}`,
      }).then(() => {
        toast.success("To'lov muvaffaqiyatli qabul qilindi!", {
          description: `${provider.toUpperCase()} orqali to'lov tasdiqlandi. ${
            planParam === "agency" ? "Agency & SMM" : "Pro Yaratuvchi"
          } tarifi avtomatik tarzda yoqildi!`,
          duration: 7000,
        });
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      });
      return;
    }

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
  }, [activateCode, activateGrantToken, recordAutoPayment, user?.email]);

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
    } else {
      toast.error(res.message);
    }
    setIsActivating(false);
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">Hisob-kitob & To'lov</h1>
      <p className="mt-2 text-muted-foreground">
        Obuna, oylik video tahlil limiti va to'lovlar boshqaruvi. To'lovlar to'g'ridan-to'g'ri Telegram bot orqali administrator tomonidan tasdiqlanadi.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Joriy tarif" value={subscription.plan.toUpperCase()} hint={subscription.billingCycle} />
        <StatCard label="Holat" value={subscription.status} />
        <StatCard
          label="Yangilanish sanasi"
          value={new Date(subscription.renewsAt).toLocaleDateString()}
        />
        <StatCard
          label="Shu oydagi foydalanish"
          value={`${subscription.usedThisMonth}/${subscription.monthlyLimit}`}
          hint={`${remaining} ta tahlil qoldi`}
        />
      </div>

      <div className="surface-card mt-6 p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Tarifni boshqarish</h2>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${Math.min(100, (subscription.usedThisMonth / subscription.monthlyLimit) * 100)}%`,
            }}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            onClick={() => setPaymentOpen(true)}
          >
            Tarifni oshirish (Telegram orqali)
          </Button>
          <Button asChild variant="outline">
            <Link to="/pricing">Tariflar jadvali</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              cancelSubscription();
              toast("Obuna bekor qilindi", { description: "Kirish yangilanish sanasigacha saqlanadi." });
            }}
          >
            Obunani bekor qilish
          </Button>
        </div>
      </div>

      {/* Manual Activation Code Card */}
      <div className="mt-6 surface-card p-6 border-cyan-500/20">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Aktivatsiya kodingiz bormi?
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Telegram orqali berilgan shaxsiy kodni kiritib, obunangizni darhol faollashtiring:
            </p>
          </div>
        </div>

        <div className="mt-4 flex max-w-md gap-2">
          <Input
            placeholder="Masalan: PRO-30D-XXXXXX yoki NEX-PRO-7727"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            className="h-9 text-xs font-mono uppercase bg-background/80"
          />
          <Button
            disabled={!promoInput.trim() || isActivating}
            onClick={handleManualActivate}
            className="h-9 px-4 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shrink-0"
          >
            {isActivating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Tekshirilmoqda...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Faollashtirish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Telegram Direct Support Box */}
      <div className="mt-6 rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-card to-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <ShieldCheck className="h-4 w-4" />
              <span>To'g'ridan-to'g'ri to'lov & VIP Yordam</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-1">
              To'lovni amalga oshirish yoki yordam kerakmi?
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Obunani Click, Payme yoki karta orqali to'lab faollashtirish uchun administratorga murojaat qiling. Telegram botda 1-bosishda dostup beriladi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-2"
              asChild
            >
              <a href={TELEGRAM_PAYMENT.telegramUrl} target="_blank" rel="noreferrer">
                <Send className="h-3.5 w-3.5" />
                @{TELEGRAM_PAYMENT.username}
              </a>
            </Button>
            <Button variant="outline" className="text-xs font-mono" asChild>
              <a href={`tel:${TELEGRAM_PAYMENT.phone}`}>
                <Phone className="h-3 w-3 mr-1 text-emerald-400" />
                {TELEGRAM_PAYMENT.displayPhone}
              </a>
            </Button>
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        selectedPlan={subscription.plan === "free" ? "pro" : "agency"}
      />
    </AppShell>
  );
}
