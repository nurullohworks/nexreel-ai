import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Check, Film, Loader2, Sparkles, UploadCloud, ShieldAlert, Cpu, Instagram, Sliders, Flame } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { UpgradeModal } from "@/components/app/UpgradeModal";
import { Button } from "@/components/ui/button";
import { formatNumber, useAppStore } from "@/lib/app-store";
import { ANALYSIS_STEPS, LIVEDUNE_NICHES, videoAnalysisService } from "@/lib/services";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Video Tahlili — NEXREEL AI" },
      {
        name: "description",
        content: "Reels yuklang va Meta reyting algoritmi hamda LiveDune benchmarklari asosida videoning uchish/uchmasligini aniqlang.",
      },
      { property: "og:title", content: "Video Tahlili — NEXREEL AI" },
      { property: "og:description", content: "Reels-ingizni yuklang va Meta algoritmi bo'yicha aniq kamchiliklarni oling." },
    ],
  }),
  component: Analyze,
});

function Analyze() {
  const { canAnalyze, addAnalysis, instagramAccount } = useAppStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState<number>(20);
  const [niche, setNiche] = useState(instagramAccount?.niche || "business");
  const [hasWatermark, setHasWatermark] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(-1);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const baselineViews = instagramAccount?.avgReelViews || 2000;

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!/\.(mp4|mov|webm|m4v)$/i.test(f.name)) {
      toast.error("Format qo'llab-quvvatlanmaydi", { description: "MP4 yoki MOV faylini yuklang." });
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      toast.error("Fayl juda katta", { description: "Maksimal hajm 500MB." });
      return;
    }
    setFile(f);

    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      const blobUrl = URL.createObjectURL(f);
      video.src = blobUrl;
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(blobUrl);
        if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
          setDurationSec(Math.round(video.duration));
        }
      };
      video.onerror = () => {
        URL.revokeObjectURL(blobUrl);
      };
    } catch (e) {
      // default duration
    }
  };

  const run = async () => {
    if (!file) return;
    if (!canAnalyze) {
      setUpgradeOpen(true);
      return;
    }
    
    try {
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setStep(i);
        await new Promise((r) => setTimeout(r, 600));
      }

      const analysis = await videoAnalysisService.analyze({
        fileName: file.name,
        sizeBytes: file.size,
        durationSec: durationSec || 20,
        niche,
        hasWatermark,
        accountAvgViews: baselineViews,
        accountHandle: instagramAccount?.handle,
      });

      await addAnalysis(analysis);
      toast.success("Tahlil yakunlandi!", { description: `${file.name} bo'yicha to'liq hisobot tayyorlandi.` });
      void navigate({ to: "/reports/$id", params: { id: analysis.id } });
    } catch (err: any) {
      console.error("Video tahlil xatosi:", err);
      toast.error("Tahlilda xatolik yuz berdi", { description: err?.message || "Iltimos qayta urinib ko'ring." });
      setStep(-1);
    }
  };

  const running = step >= 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
          <Cpu className="h-4 w-4" />
          <span>{t("analyze_engine_badge", "Meta Reels Algoritmi & LiveDune Dvigateli")}</span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t("analyze_title", "Algoritmik Video Diagnostikasi")}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
          {t("analyze_desc", "Reels-ingizni nashr etishdan oldin tekshiring: Meta algoritmi uni Explore-ga chiqaradimi yoki bloklaydimi?")}
        </p>

        {/* Instagram Account Connection Badge */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 via-background to-emerald-500/5 p-4 text-xs backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 text-white shadow-md">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                {instagramAccount?.isConnected
                  ? `${t("analyze_acc_connected", "Ulangan Akkaunt:")} ${instagramAccount.handle}`
                  : t("analyze_acc_not_connected", "Instagram akkaunt ulanmagan")}
              </p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                {instagramAccount?.isConnected
                  ? `${t("analyze_acc_sub_connected", "Bashorat moslashtirilgan:")} ${formatNumber(instagramAccount.avgReelViews)}`
                  : t("analyze_acc_sub_not", "Natija aniqroq bo'lishi uchun akkauntingizni ulab qo'ying.")}
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs shrink-0 border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300">
            <Link to="/accounts">
              <Sliders className="mr-1.5 h-3.5 w-3.5" />
              {instagramAccount?.isConnected
                ? t("analyze_acc_btn_adjust", "Moslash")
                : t("analyze_acc_btn_connect", "Akkauntni Ulash")}
            </Link>
          </Button>
        </div>

        {!running ? (
          <>
            {/* Niche Selector */}
            <div className="mt-6 rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                {t("analyze_niche_label", "Sohangizni (Nishani) tanlang (LiveDune bozor benchmarki uchun):")}
              </label>
              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {LIVEDUNE_NICHES.map((n) => (
                  <button
                    key={n.key}
                    type="button"
                    onClick={() => setNiche(n.key)}
                    className={cn(
                      "flex flex-col items-start rounded-xl border p-3 text-left text-xs transition-all",
                      niche === n.key
                        ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-500/30"
                        : "border-border/70 bg-surface/40 text-muted-foreground hover:bg-surface hover:text-foreground",
                    )}
                  >
                    <span className="font-semibold">{n.name}</span>
                    <span className="mt-1 line-clamp-1 text-[10px] opacity-75">{n.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pick(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/80 bg-surface/30 px-6 py-14 text-center transition-all hover:border-cyan-500/50 hover:bg-cyan-500/5 group",
                dragging && "border-cyan-400 bg-cyan-500/10 scale-[1.01]",
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition-transform">
                {file ? <Film className="h-7 w-7 text-emerald-400" /> : <UploadCloud className="h-7 w-7 text-cyan-400" />}
              </div>
              <p className="mt-4 text-base sm:text-lg font-bold text-foreground">
                {file ? file.name : t("analyze_drop_title", "Reels videongizni shu yerga tashlang")}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground font-mono">
                {file
                  ? `${(file.size / (1024 * 1024)).toFixed(1)} MB · ${durationSec}s`
                  : t("analyze_drop_supported", "Qo'llab-quvvatlanadi: MP4, MOV, WebM · Maksimal: 500MB")}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => pick(e.target.files?.[0])}
              />
            </div>

            {/* Additional Options */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border/70 bg-card/40 px-4 py-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-warning" />
                <span className="text-muted-foreground font-medium">
                  {t("analyze_watermark_q", "Videoda TikTok yoki CapCut suv belgisi (watermark) bormi?")}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasWatermark}
                  onChange={(e) => setHasWatermark(e.target.checked)}
                  className="rounded border-border text-cyan-500 focus:ring-cyan-500 h-4 w-4 bg-background"
                />
                <span className="font-semibold text-foreground">
                  {hasWatermark ? t("analyze_watermark_yes", "Ha (jazolanadi)") : t("analyze_watermark_no", "Yo'q (toza)")}
                </span>
              </label>
            </div>

            <Button
              className="mt-6 w-full py-6 text-base font-extrabold shadow-xl shadow-cyan-500/20 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 text-slate-950 transition-all active:scale-[0.99]"
              size="lg"
              disabled={!file}
              onClick={() => void run()}
            >
              <Flame className="mr-2 h-5 w-5" />
              {t("analyze_btn_run", "Virallikni Tahlil Qilish (Meta 5 Drayveri)")}
            </Button>
            <p className="mt-3.5 text-center text-[11px] text-muted-foreground leading-relaxed">
              {t("analyze_disclaimer", "Tahlil Meta Reels ranking signallari (Sends/Reach, 3s Hook retention, Loop factor) va sizning akkauntingiz ko'rsatkichlari asosida hisoblanadi.")}
            </p>
          </>
        ) : (
          <div className="surface-card mt-8 p-8 border border-cyan-500/30 shadow-2xl rounded-2xl bg-card/90">
            <div className="flex items-center gap-3.5">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <div>
                <p className="text-sm font-bold text-foreground">{file?.name} ({(file!.size / (1024 * 1024)).toFixed(1)} MB)</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("analyze_progress_text", "Meta algoritmi va akkauntingiz benchmarklari tahlil qilinmoqda...")}
                </p>
              </div>
            </div>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-[width] duration-500 shadow-sm"
                style={{ width: `${((step + 1) / ANALYSIS_STEPS.length) * 100}%` }}
              />
            </div>
            <ol className="mt-8 space-y-3.5">
              {ANALYSIS_STEPS.map((label, i) => (
                <li key={label} className="flex items-center gap-3 text-xs sm:text-sm">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-lg border font-mono text-[10px] font-bold",
                      i < step && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
                      i === step && "border-cyan-500/60 bg-cyan-500/20 text-cyan-300 animate-pulse",
                      i > step && "border-border/70 text-muted-foreground",
                    )}
                  >
                    {i < step ? <Check className="h-3.5 w-3.5" /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={cn(i <= step ? "text-foreground font-semibold" : "text-muted-foreground")}>
                    {label}
                  </span>
                  {i === step ? <span className="shimmer ml-auto h-1.5 w-20 rounded-full" /> : null}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </AppShell>
  );
}
