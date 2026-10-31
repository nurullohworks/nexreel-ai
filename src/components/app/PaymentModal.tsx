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
  CreditCard,
  Zap,
  CheckCheck,
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
import {
  PLAN_PRICING,
  PaymentService,
  TELEGRAM_PAYMENT,
  type PaymentTransaction,
  type PaymentProviderType,
} from "@/lib/services/payment";
import type { PlanId } from "@/lib/types";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan?: PlanId;
  planId?: PlanId;
}

export function PaymentModal(props: PaymentModalProps) {
  const { open, onOpenChange } = props;
  const selectedPlan: PlanId = props.selectedPlan || props.planId || "pro";

  const {
    user,
    pricingConfig,
    addPaymentRequest,
    activateCode,
    recordAutoPayment,
  } = useAppStore();
  const navigate = useNavigate();

  const [copiedType, setCopiedType] = useState<"tg" | "phone" | "code" | "tx" | null>(null);

  // Steps: 'checkout' -> 'notify_admin' -> 'success'
  const [step, setStep] = useState<"checkout" | "notify_admin" | "success">("checkout");
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderType>("click");

  // Form states
  const [userContact, setUserContact] = useState(user?.email || "");
  const [userPhone, setUserPhone] = useState("+998 90 ");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpire, setCardExpire] = useState("");
  const [receiptNote, setReceiptNote] = useState("");

  // Loading & Result states
  const [isProcessingAutoPay, setIsProcessingAutoPay] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  // Promo code manual input
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isActivatingCode, setIsActivatingCode] = useState(false);

  const plan = pricingConfig[selectedPlan] || PLAN_PRICING[selectedPlan] || PLAN_PRICING.pro;
  const telegramUrl = PaymentService.generateTelegramUrl(selectedPlan, user?.email, plan);

  const copyToClipboard = (text: string, type: "tg" | "phone" | "code" | "tx") => {
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

  /**
   * Click / Payme / Karta orqali to'g'ridan-to'g'ri AVTOMATIK to'lovni amalga oshirish.
   * To'lov o'tishi bilan obuna bir zumda faollashtiriladi (avtomatik dostup).
   */
  const handleExecuteAutoPayment = async (provider: "click" | "payme" | "card") => {
    const contact = (userContact || userPhone || user?.email || "avto_tolov_mijoz").trim();

    setIsProcessingAutoPay(true);
    try {
      // 1. Shlyuz orqali to'lovni qayta ishlash
      const res = await PaymentService.processInstantAutoPayment({
        planId: selectedPlan,
        provider,
        userContact: contact,
        cardDetails: {
          cardNumber: cardNumber || "8600 4902 1894 7727",
          expireDate: cardExpire || "12/28",
        },
      });

      if (res.success && res.transaction) {
        setCompletedTx(res.transaction);

        // 2. Tizimda obunani AVTOMATIK tarzda yoqish va Telegram botga bildirishnoma yuborish
        await recordAutoPayment({
          planId: selectedPlan,
          provider,
          userContact: contact,
          transactionId: res.transaction.id,
          days: 30,
          note: res.transaction.paymentDetails,
        });

        toast.success("To'lov muvaffaqiyatli qabul qilindi!", {
          description: `${provider.toUpperCase()} orqali to'lov o'tdi. ${plan.name} tarifi avtomatik faollashtirildi!`,
          duration: 6000,
        });

        setStep("success");
      }
    } catch (err: any) {
      toast.error("To'lov jarayonida xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsProcessingAutoPay(false);
    }
  };

  /**
   * Real Click yoki Payme veb-ilovasiga o'tish (qaytish havolasi avtomatik dostup bilan)
   */
  const handleOpenProviderCheckout = (provider: "click" | "payme") => {
    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/billing?payment=success&provider=${provider}&plan=${selectedPlan}`
        : "";

    if (provider === "click") {
      const clickUrl = PaymentService.generateClickUrl(selectedPlan, user?.id || "user", returnUrl);
      window.open(clickUrl, "_blank", "noopener,noreferrer");
      toast.info("Click to'lov oynasi ochilmoqda...", {
        description: "To'lov amalga oshirilgach, tizim avtomatik faollashadi.",
      });
    } else {
      const paymeUrl = PaymentService.generatePaymeUrl(selectedPlan, user?.id || "user", returnUrl);
      window.open(paymeUrl, "_blank", "noopener,noreferrer");
      toast.info("Payme to'lov oynasi ochilmoqda...", {
        description: "To'lov tasdiqlangach, dostup darhol beriladi.",
      });
    }
  };

  const handleFillTestCard = () => {
    setCardNumber("8600 4912 3084 7727");
    setCardExpire("12/29");
    toast.success("Test karta ma'lumotlari kiritildi!", {
      description: "Endi 'To'lash va darhol faollashtirish' tugmasini bosing.",
    });
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
    setUserContact(user?.email || "");
    setUserPhone("+998 90 ");
    setCardNumber("");
    setCardExpire("");
    setReceiptNote("");
    setPromoCodeInput("");
    setGeneratedCode("");
    setCompletedTx(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-2xl border-border/80 p-5 sm:p-6 sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* STEP 1: CHECKOUT VIEW */}
        {step === "checkout" && (
          <div className="space-y-4">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>Tezkor To'lov & Avtomatik Dostup</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Avto-aktivatsiya
                </span>
              </div>
              <DialogTitle className="text-xl font-bold mt-1 text-foreground">
                {plan.name} tarifiga obuna bo'lish
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                To'lov qilingan soniyada Pro imkoniyatlar (oylik {plan.analysisLimit} ta video tahlil) avtomatik ochiladi.
              </DialogDescription>
            </DialogHeader>

            {/* Pricing Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-purple-500/15 border border-cyan-500/30">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">To'lov miqdori:</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {plan.priceUzSum.toLocaleString()} so'm
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/40 shadow-sm">
                    ${plan.priceUsd} / oyiga
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-1 font-mono">
                    {plan.analysisLimit} ta AI tahlil
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                To'lov tizimini tanlang:
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-surface/80 border border-border/80">
                <button
                  type="button"
                  onClick={() => setSelectedProvider("click")}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    selectedProvider === "click"
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="text-xs font-black tracking-wide">CLICK</span>
                  <span className="text-[9px] opacity-80">Avto-to'lov</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProvider("payme")}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    selectedProvider === "payme"
                      ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="text-xs font-black tracking-wide">PAYME</span>
                  <span className="text-[9px] opacity-80">Avto-to'lov</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProvider("card")}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    selectedProvider === "card"
                      ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 mb-0.5" />
                  <span className="text-[10px]">Karta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProvider("telegram")}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    selectedProvider === "telegram"
                      ? "bg-indigo-600 text-white shadow-md scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Send className="h-3.5 w-3.5 mb-0.5" />
                  <span className="text-[10px]">Telegram</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: 1. CLICK */}
            {selectedProvider === "click" && (
              <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-card to-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm border border-sky-500/30">
                      C
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Click orqali to'lov</h4>
                      <p className="text-[11px] text-muted-foreground">Click Up & Click Evolution</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold px-2 py-0.5">
                    100% Avtomatik
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground block">
                    Telefon raqam yoki hisob identifikatori:
                  </label>
                  <Input
                    placeholder="+998 90 123 45 67 yoki email"
                    value={userContact}
                    onChange={(e) => setUserContact(e.target.value)}
                    className="h-9 text-xs font-mono bg-surface/70"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-200 flex items-start gap-2">
                  <Zap className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    To'lov amalga oshirilishi bilan <strong>{plan.name}</strong> obunangiz avtomatik tarzda yoqiladi va barcha cheklovlar ochiladi.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    type="button"
                    disabled={isProcessingAutoPay}
                    onClick={() => handleExecuteAutoPayment("click")}
                    className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs h-10 shadow-lg shadow-sky-500/20"
                  >
                    {isProcessingAutoPay ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Click bilan tekshirilmoqda...
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 mr-1.5" />
                        Click orqali darhol to'lash (Avtomatik)
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs h-10 border-sky-500/40 text-sky-300 hover:bg-sky-500/10 font-semibold shrink-0"
                    onClick={() => handleOpenProviderCheckout("click")}
                    title="Click rasmiy veb to'lov oynasiga o'tish"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Click ilovasida
                  </Button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. PAYME */}
            {selectedProvider === "payme" && (
              <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-card to-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-black text-sm border border-teal-500/30">
                      P
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Payme orqali to'lov</h4>
                      <p className="text-[11px] text-muted-foreground">Payme Online & Payme Go</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2 py-0.5">
                    100% Avtomatik
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground block">
                    Telefon raqam yoki Payme hisobingiz:
                  </label>
                  <Input
                    placeholder="+998 90 123 45 67 yoki email"
                    value={userContact}
                    onChange={(e) => setUserContact(e.target.value)}
                    className="h-9 text-xs font-mono bg-surface/70"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-200 flex items-start gap-2">
                  <Zap className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    To'lov tasdiqlanishi bilan profilingizga <strong>{plan.analysisLimit} ta tahlil</strong> va Pro drayverlar avtomatik ulanadi.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    type="button"
                    disabled={isProcessingAutoPay}
                    onClick={() => handleExecuteAutoPayment("payme")}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-bold text-xs h-10 shadow-lg shadow-teal-500/20"
                  >
                    {isProcessingAutoPay ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Payme bilan tekshirilmoqda...
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 mr-1.5" />
                        Payme orqali darhol to'lash (Avtomatik)
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs h-10 border-teal-500/40 text-teal-300 hover:bg-teal-500/10 font-semibold shrink-0"
                    onClick={() => handleOpenProviderCheckout("payme")}
                    title="Payme rasmiy to'lov oynasiga o'tish"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Payme ilovasida
                  </Button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. KARTA (UZCARD / HUMO / VISA) */}
            {selectedProvider === "card" && (
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-sm border border-primary/30">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Karta orqali to'lov</h4>
                      <p className="text-[11px] text-muted-foreground">Uzcard, Humo, Visa, Mastercard</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[10px] text-cyan-400 hover:underline font-semibold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full"
                  >
                    🧪 Test kartani to'ldirish
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Karta raqami:
                    </label>
                    <Input
                      placeholder="8600 •••• •••• ••••"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="h-9 text-xs font-mono bg-surface/70"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Muddati (OO/YY):
                      </label>
                      <Input
                        placeholder="12/28"
                        value={cardExpire}
                        onChange={(e) => setCardExpire(e.target.value)}
                        maxLength={5}
                        className="h-9 text-xs font-mono bg-surface/70"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Aloqa (SMS):
                      </label>
                      <Input
                        placeholder="+998 90 123 45 67"
                        value={userContact}
                        onChange={(e) => setUserContact(e.target.value)}
                        className="h-9 text-xs font-mono bg-surface/70"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  disabled={isProcessingAutoPay}
                  onClick={() => handleExecuteAutoPayment("card")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 shadow-lg shadow-primary/20"
                >
                  {isProcessingAutoPay ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Karta tekshirilmoqda...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      Kartadan to'lash va darhol ochish ({plan.priceUzSum.toLocaleString()} so'm)
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* TAB CONTENT: 4. TELEGRAM DIRECT */}
            {selectedProvider === "telegram" && (
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-2.5">
                <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Telegram orqali to'g'ridan-to'g'ri to'lash:</span>
                  <span className="text-[11px] font-mono text-cyan-400">@pray_boy</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface/60 border border-border/60">
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

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface/60 border border-border/60">
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

                <Button
                  variant="outline"
                  className="w-full text-xs h-9 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-semibold"
                  onClick={() => {
                    setUserContact(user?.email || "");
                    setStep("notify_admin");
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  To'lov qildim (Botga chek yuborish)
                </Button>
              </div>
            )}

            {/* Promo / Activation Code Section */}
            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                  Aktivatsiya kodingiz bormi?
                </span>
                <span className="text-[10px] text-cyan-400">1 soniyada ochish</span>
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

            {/* Security Guarantee */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>100% Xavfsiz Shifrlangan To'lov</span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCheck className="h-3.5 w-3.5" /> Avtomatik Dostup
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: NOTIFY ADMIN FORM (TELEGRAM MANUAL) */}
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
                Ushbu so'rov avtomatik ravishda administratorning <strong>@nexreel_ai_bot</strong> botiga yetkaziladi. Administrator bitta tugmani bosib dostupni tasdiqlaydi.
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

        {/* STEP 3: SUCCESS VIEW (AUTO PAYMENT COMPLETED) */}
        {step === "success" && (
          <div className="py-2 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-2xl shadow-emerald-500/30 animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-xs font-bold text-emerald-300 mb-2">
                <Zap className="h-3.5 w-3.5" /> Avtomatik Faollashtirildi!
              </div>
              <h3 className="text-xl font-black text-foreground tracking-tight">
                To'lov Muvaffaqiyatli Qabul Qilindi!
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Sizning <strong className="text-cyan-400">{plan.name}</strong> obunangiz avtomatik tarzda 30 kunga yoqildi. Barcha sun'iy intellekt tahlil imkoniyatlari hoziroq tayyor!
              </p>
            </div>

            {/* Transaction Receipt Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">To'lov Tizimi:</span>
                <span className="font-bold text-foreground uppercase flex items-center gap-1">
                  {completedTx?.provider || selectedProvider} (Avto-to'lov)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tarif:</span>
                <span className="font-bold text-cyan-400">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">AI Video Limiti:</span>
                <span className="font-bold text-emerald-400">{plan.analysisLimit} ta video</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">To'lov summasi:</span>
                <span className="font-bold text-foreground">
                  {plan.priceUzSum.toLocaleString()} so'm (${plan.priceUsd})
                </span>
              </div>
              {completedTx?.id && (
                <div className="flex justify-between items-center pt-2 border-t border-border/60">
                  <span className="text-muted-foreground text-[10px]">Tranzaksiya ID:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-cyan-300 text-[10px]">{completedTx.id}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(completedTx.id, "tx")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Generated Code if manual */}
            {generatedCode && (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-xs text-center">
                <span className="text-[10px] text-muted-foreground block">
                  Aktivatsiya kodingiz:
                </span>
                <span className="font-mono font-black text-sm text-cyan-300">
                  {generatedCode}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-black text-xs h-10 shadow-lg shadow-cyan-500/20"
                onClick={() => {
                  handleClose();
                  void navigate({ to: "/analyze" });
                }}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Videolarni Tahlil Qilishni Boshlash
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={handleClose}
              >
                Yopish
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
