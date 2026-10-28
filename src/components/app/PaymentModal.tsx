import { useState } from "react";
import { Check, Sparkles, ShieldCheck, Send, Copy, Phone, ExternalLink, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";
import { PLAN_PRICING, PaymentService, TELEGRAM_PAYMENT } from "@/lib/services/payment";
import type { PlanId } from "@/lib/types";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: PlanId;
}

export function PaymentModal({ open, onOpenChange, selectedPlan }: PaymentModalProps) {
  const { setPlan, user } = useAppStore();
  const [copiedType, setCopiedType] = useState<"tg" | "phone" | null>(null);

  const plan = PLAN_PRICING[selectedPlan] || PLAN_PRICING.pro;

  const telegramUrl = PaymentService.generateTelegramUrl(selectedPlan, user?.email);

  const copyToClipboard = (text: string, type: "tg" | "phone") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success("Nusxa olindi!", { description: text });
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleOpenTelegram = () => {
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
    toast.info("Telegram ochilmoqda...", {
      description: `@${TELEGRAM_PAYMENT.username} ga to'lov xabari yuborilmoqda.`,
    });
  };

  const handleConfirmPaid = () => {
    setPlan(selectedPlan);
    toast.success("Tabriklaymiz! Tarif faollashtirildi!", {
      description: `${plan.name} tarifi hisobingizga muvaffaqiyatli ulandi.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/80 p-6 sm:rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Rasmiy To'lov & Faollashtirish</span>
          </div>
          <DialogTitle className="text-xl font-bold mt-1 text-foreground">
            {plan.name} tarifiga obuna bo'lish
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Oylik {plan.analysisLimit} ta to'liq video tahlili va Meta 5 drayverli diagnostika
          </DialogDescription>
        </DialogHeader>

        {/* Pricing Summary */}
        <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 via-primary/5 to-purple-500/10 border border-cyan-500/20">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-muted-foreground block">To'lov miqdori:</span>
              <span className="text-2xl font-black text-foreground tracking-tight">
                {plan.priceUzSum.toLocaleString()} so'm
              </span>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                ${plan.priceUsd} / oyiga
              </span>
              <span className="text-[11px] text-muted-foreground block mt-1">
                {plan.analysisLimit} ta AI tahlil
              </span>
            </div>
          </div>
        </div>

        {/* Telegram Direct CTA Button */}
        <div className="mt-4">
          <Button
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
            onClick={handleOpenTelegram}
          >
            <Send className="h-4 w-4" />
            <span>Telegram orqali to'lov qilish (@{TELEGRAM_PAYMENT.username})</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </Button>
          <p className="text-[11px] text-center text-muted-foreground mt-2">
            Tugmani bossangiz, avtomatik to'lov ma'lumotlari bilan Telegram ochiladi.
          </p>
        </div>

        {/* Direct Contacts Card */}
        <div className="mt-4 rounded-xl border border-border/80 bg-secondary/30 p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground font-medium">
            <span>To'g'ridan-to'g'ri bog'lanish:</span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Onlayn administrator
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-bold">Telegram:</span>
              <a
                href={TELEGRAM_PAYMENT.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-cyan-300 hover:underline"
              >
                @{TELEGRAM_PAYMENT.username}
              </a>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => copyToClipboard(`@${TELEGRAM_PAYMENT.username}`, "tg")}
            >
              {copiedType === "tg" ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="h-3 w-3" /> Nusxalandi
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Nusxa
                </span>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/60">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-muted-foreground">Telefon:</span>
              <a
                href={`tel:${TELEGRAM_PAYMENT.phone}`}
                className="font-mono text-foreground font-semibold hover:underline"
              >
                {TELEGRAM_PAYMENT.displayPhone}
              </a>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => copyToClipboard(TELEGRAM_PAYMENT.phone, "phone")}
            >
              {copiedType === "phone" ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="h-3 w-3" /> Nusxalandi
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Nusxa
                </span>
              )}
            </Button>
          </div>

          <div className="pt-1 text-[11px] text-muted-foreground/80 leading-relaxed">
            💳 <strong className="text-foreground/90">To'lov turlari:</strong> Click, Payme, Uzcard, Humo, Visa/Mastercard. Chekni Telegramga yuborishingiz bilan tarifingiz darhol yoqiladi.
          </div>
        </div>

        {/* Security & Instant Activation Confirmation */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Xavfsiz to'lov & Kafolat</span>
          </div>
          <span>Tezkor 5 daqiqada faollashtirish</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2">
          <Button variant="ghost" className="flex-1 text-xs" onClick={() => onOpenChange(false)}>
            Yopish
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-semibold"
            onClick={handleConfirmPaid}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            To'lov qildim (Faollashtirish)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
