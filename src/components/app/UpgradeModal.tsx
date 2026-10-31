import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Send, Phone, ExternalLink } from "lucide-react";
import { useAppStore } from "@/lib/app-store";
import { PaymentService, TELEGRAM_PAYMENT } from "@/lib/services/payment";
import { toast } from "sonner";

export function UpgradeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan?: "pro" | "agency";
}) {
  const { setPlan, user } = useAppStore();

  const handleOpenTelegram = () => {
    const url = PaymentService.generateTelegramUrl("pro", user?.email);
    window.open(url, "_blank", "noopener,noreferrer");
    toast.info("Telegram ochilmoqda...", {
      description: `@${TELEGRAM_PAYMENT.username} ga Pro tarifi uchun xabar yuborilmoqda.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/80 bg-card/95 backdrop-blur-xl p-6 sm:rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              AI Kreditlar Cheklovi
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              AI Kreditlaringiz yetarli emas
            </DialogTitle>
          </div>
        </div>

        <DialogDescription className="text-xs text-muted-foreground leading-relaxed mt-2">
          Tanlangan AI model (Gemini, Claude yoki GPT-4o) token sarfiga mos kredit talab qiladi. Tahlillarni davom ettirish uchun Pro (1,200 Kredit) yoki Agency (4,000 Kredit) tarifiga o'ting!
        </DialogDescription>

        <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 text-xs space-y-1.5 mt-2">
          <div className="flex justify-between items-center text-foreground font-semibold">
            <span>Pro (1,200 AI Kredit):</span>
            <span className="text-cyan-400">190,000 so'm / oyiga</span>
          </div>
          <div className="flex justify-between items-center text-foreground font-semibold">
            <span>Agency (4,000 AI Kredit):</span>
            <span className="text-emerald-400">490,000 so'm / oyiga</span>
          </div>
          <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            Telegram: <a href={TELEGRAM_PAYMENT.telegramUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">@{TELEGRAM_PAYMENT.username}</a> · Tel: <a href={`tel:${TELEGRAM_PAYMENT.phone}`} className="text-foreground hover:underline font-mono">{TELEGRAM_PAYMENT.displayPhone}</a>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full h-11 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            onClick={handleOpenTelegram}
          >
            <Send className="h-4 w-4" />
            <span>Telegram orqali Pro olish (@{TELEGRAM_PAYMENT.username})</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-xs"
              asChild
              onClick={() => onOpenChange(false)}
            >
              <Link to="/pricing">Tariflarni ko'rish</Link>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-xs text-muted-foreground"
              onClick={() => {
                setPlan("pro");
                toast.success("Pro tarifi muvaffaqiyatli faollashtirildi!");
                onOpenChange(false);
              }}
            >
              Faollashtirish (Sinov)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
