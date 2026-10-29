import { useState } from "react";
import {
  Check,
  Sparkles,
  ShieldCheck,
  Send,
  Copy,
  Phone,
  ExternalLink,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/app-store";
import { PLAN_PRICING, PaymentService, TELEGRAM_PAYMENT } from "@/lib/services/payment";
import type { PlanId } from "@/lib/types";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan?: PlanId;
  planId?: PlanId;
}

export function PaymentModal(props: PaymentModalProps) {
  const { open, onOpenChange } = props;
  const selectedPlan: PlanId = props.selectedPlan || props.planId || "pro";

  const { user, pricingConfig, addPaymentRequest, activateCode } = useAppStore();
  const [copiedType, setCopiedType] = useState<"tg" | "phone" | "code" | null>(null);

  // Steps: 'checkout' -> 'notify_admin' -> 'success'
  const [step, setStep] = useState<"checkout" | "notify_admin" | "success">("checkout");
  const [userContact, setUserContact] = useState("");
  const [receiptNote, setReceiptNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  // Promo code manual input
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isActivatingCode, setIsActivatingCode] = useState(false);

  const plan = pricingConfig[selectedPlan] || PLAN_PRICING[selectedPlan] || PLAN_PRICING.pro;
  const telegramUrl = PaymentService.generateTelegramUrl(selectedPlan, user?.email, plan);

  const copyToClipboard = (text: string, type: "tg" | "phone" | "code") => {
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

  const handleStartVerification = () => {
    setUserContact(user?.email || "");
    setStep("notify_admin");
  };

  const handleSendToBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userContact.trim()) {
      toast.error("Iltimos, telefon raqamingiz yoki Telegram usernameingizni kiriting!");
      return;
    }

    setIsSending(true);

    try {
      const res = await addPaymentRequest({
        userContact: userContact.trim(),
        planId: selectedPlan,
        planName: plan.name,
        priceUzSum: plan.priceUzSum,
        priceUsd: plan.priceUsd,
        analysisLimit: plan.analysisLimit,
        note: receiptNote.trim(),
      });

      if (res.activationCode) {
        setGeneratedCode(res.activationCode);
      }

      if (res.success) {
        toast.success("Xabar administrator Telegram botiga muvaffaqiyatli yuborildi!");
      } else {
        toast.info("So'rovingiz qayd etildi va administrator paneliga yuborildi!");
      }
      setStep("success");
    } catch (err) {
      toast.error("Xatolik yuz berdi, qaytadan urinib ko'ring.");
    } finally {
      setIsSending(false);
    }
  };

  const handleActivateManualCode = () => {
    if (!promoCodeInput.trim()) return;
    setIsActivatingCode(true);
    const res = activateCode(promoCodeInput.trim());
    if (res.success) {
      toast.success(res.message, {
        description: "Tarifingiz muvaffaqiyatli faollashtirildi!",
        duration: 5000,
      });
      handleClose();
    } else {
      toast.error(res.message);
    }
    setIsActivatingCode(false);
  };

  const handleClose = () => {
    setStep("checkout");
    setUserContact("");
    setReceiptNote("");
    setPromoCodeInput("");
    setGeneratedCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/80 p-6 sm:rounded-2xl shadow-2xl">
        {/* STEP 1: CHECKOUT VIEW */}
        {step === "checkout" && (
          <>
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
                    {plan.analysisLimit} ta video tahlili
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Telegram Admin Payment Method */}
            <div className="mt-4 space-y-2.5">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Telegram orqali to'g'ridan-to'g'ri to'lash:</span>
                <span className="text-[11px] font-mono text-cyan-400">@pray_boy</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/60">
                <div className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-muted-foreground text-xs">Telegram:</span>
                  <span className="font-mono text-cyan-300 font-semibold text-xs">
                    @{TELEGRAM_PAYMENT.username}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
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
                  <Button
                    size="sm"
                    className="h-7 px-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] border border-sky-500/30"
                    onClick={handleOpenTelegram}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ochish
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/60">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-muted-foreground text-xs">Telefon:</span>
                  <a
                    href={`tel:${TELEGRAM_PAYMENT.phone}`}
                    className="font-mono text-foreground font-semibold hover:underline text-xs"
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
                💳 <strong className="text-foreground/90">To'lov turlari:</strong> Click, Payme, Uzcard, Humo, Visa/Mastercard. To'lov qilgach, quyidagi tugma orqali xabar bering.
              </div>
            </div>

            {/* Promo / Activation Code Section */}
            <div className="mt-3 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                  Aktivatsiya kodingiz bormi?
                </span>
                <span className="text-[10px] text-cyan-400">Darhol faollashtirish</span>
              </div>
              <div className="flex gap-1.5">
                <Input
                  placeholder="Masalan: PRO-30D-XXXXXX"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  className="h-8 text-xs font-mono uppercase bg-surface/60"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!promoCodeInput.trim() || isActivatingCode}
                  onClick={handleActivateManualCode}
                  className="h-8 px-3 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shrink-0"
                >
                  {isActivatingCode ? "..." : "Faollashtirish"}
                </Button>
              </div>
            </div>

            {/* Security */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>100% Xavfsiz to'lov & Kafolat</span>
              </div>
              <span className="text-emerald-400 font-semibold">1-klikda faollashtirish</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex gap-2">
              <Button variant="ghost" className="flex-1 text-xs" onClick={handleClose}>
                Yopish
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-semibold"
                onClick={handleStartVerification}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                To'lov qildim (Faollashtirish)
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: NOTIFY ADMIN FORM */}
        {step === "notify_admin" && (
          <form onSubmit={handleSendToBot} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="hover:text-foreground flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Orqaga
                </button>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                To'lovni Tasdiqlash So'rovi
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Administrator Telegram botiga xabar boradi va u 1 ta tugma bosish bilan hisobingizga dostup beradi.
              </DialogDescription>
            </DialogHeader>

            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">
                Telegram usernameingiz yoki Telefon raqamingiz: <span className="text-cyan-400">*</span>
              </label>
              <Input
                required
                placeholder="+998 90 123 45 67 yoki @username"
                value={userContact}
                onChange={(e) => setUserContact(e.target.value)}
                className="h-10 text-xs font-mono"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                To'lov cheki / karta oxirgi 4 raqami (ixtiyoriy):
              </label>
              <Input
                placeholder="Masalan: Click orqali to'landi, karta 1234"
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="rounded-lg bg-secondary/30 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2 border border-cyan-500/20">
              <AlertCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Ushbu so'rov avtomatik ravishda administratorning <strong>@nexreel_ai_bot</strong> botiga yetkaziladi. Administrator Telegram ichidagi bitta tugmani bosish orqali tarifingizni yoqadi.
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-xs"
                onClick={() => setStep("checkout")}
              >
                Orqaga
              </Button>
              <Button
                type="submit"
                disabled={isSending}
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs h-10 shadow-md shadow-sky-500/20"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Botga Xabar Yuborish
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS VIEW */}
        {step === "success" && (
          <div className="py-4 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">So'rovingiz qabul qilindi!</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                So'rovingiz administrator Telegram botiga yetkazildi. Administrator botdagi <strong>"1-bosishda dostup berish"</strong> tugmasini bosishi bilanoq obunangiz avtomatik faollashadi.
              </p>
            </div>

            {/* Generated Activation Code */}
            {generatedCode && (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs space-y-1.5 text-center">
                <span className="text-[11px] text-muted-foreground block">
                  Sizning shaxsiy aktivatsiya kodingiz:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-black text-sm text-cyan-300 tracking-wider">
                    {generatedCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedCode, "code")}
                    className="p-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                    title="Nusxa olish"
                  >
                    {copiedType === "code" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Ushbu kod orqali istalgan qurilmadan obunani bir soniyada faollashtirishingiz mumkin.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border/80 bg-secondary/30 p-3 text-xs space-y-1 text-left font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kontakt:</span>
                <span className="font-bold text-foreground">{userContact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarif:</span>
                <span className="font-bold text-cyan-400">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Summa:</span>
                <span className="font-bold text-foreground">{plan.priceUzSum.toLocaleString()} so'm</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={handleOpenTelegram}
              >
                <Send className="h-3.5 w-3.5 mr-1.5 text-sky-400" />
                Telegramda administratorga yozish (@{TELEGRAM_PAYMENT.username})
              </Button>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
                onClick={handleClose}
              >
                Tushunarli, yopish
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
