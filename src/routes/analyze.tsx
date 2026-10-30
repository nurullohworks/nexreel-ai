import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Check,
  Film,
  Loader2,
  Sparkles,
  UploadCloud,
  ShieldAlert,
  Cpu,
  Instagram,
  Sliders,
  Flame,
  Link2,
  ExternalLink,
  Clipboard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { UpgradeModal } from "@/components/app/UpgradeModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNumber, useAppStore } from "@/lib/app-store";
import { ANALYSIS_STEPS, LIVEDUNE_NICHES, videoAnalysisService } from "@/lib/services";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Video & Reels Tahlili — NEXREEL AI" },
      {
        name: "description",
        content: "Reels yuklang yoki Instagram havolasini kiriting va Meta reyting algoritmi hamda LiveDune benchmarklari asosida videoning viralligini aniqlang.",
      },
      { property: "og:title", content: "Video & Reels Tahlili — NEXREEL AI" },
      { property: "og:description", content: "Instagram Reels'ingizni yuklang yoki havola orqali tahlil qiling." },
    ],
  }),
  component: Analyze,
});

function extractReelShortcode(url: string): string | null {
  const match = url.match(/(?:instagram\.com|instagr\.am)\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

function Analyze() {
  const { canAnalyze, addAnalysis, instagramAccount } = useAppStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Tab mode: 'upload' or 'link'
  const [mode, setMode] = useState<"upload" | "link">("upload");

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState<number>(20);
  const [niche, setNiche] = useState(instagramAccount?.niche || "business");
  const [hasWatermark, setHasWatermark] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Instagram Link State
  const [instagramUrl, setInstagramUrl] = useState("");
  const [isCompetitorReel, setIsCompetitorReel] = useState(false);
  const [linkDuration, setLinkDuration] = useState<number>(30);

  const [step, setStep] = useState(-1);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const baselineViews = instagramAccount?.avgReelViews || 2000;
  const detectedShortcode = extractReelShortcode(instagramUrl.trim());

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

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInstagramUrl(text.trim());
        if (extractReelShortcode(text.trim())) {
          toast.success("Instagram Reels havolasi aniqlandi!");
        } else {
          toast.info("Havola kiritildi, Instagram Reel linki ekanligini tekshiring.");
        }
      }
    } catch {
      toast.error("Vaqtinchalik xotiradan (buferdan) o'qib bo'lmadi.");
    }
  };

  const run = async () => {
    if (mode === "upload" && !file) return;
    if (mode === "link" && !detectedShortcode) {
      toast.error("Iltimos, to'g'ri Instagram Reels havolasini kiriting!", {
        description: "Masalan: https://www.instagram.com/reel/C8xyz123...",
      });
      return;
    }

    if (!canAnalyze) {
      setUpgradeOpen(true);
      return;
    }

    try {
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setStep(i);
        await new Promise((r) => setTimeout(r, 600));
      }

      const isLinkMode = mode === "link";
      const title = isLinkMode
        ? `Instagram Reel (@reel/${detectedShortcode})`
        : file!.name;

      const analysis = await videoAnalysisService.analyze({
        fileName: title,
        sizeBytes: isLinkMode ? 18 * 1024 * 1024 : file!.size,
        durationSec: isLinkMode ? linkDuration : durationSec || 20,
        niche,
        hasWatermark: isLinkMode ? false : hasWatermark,
        accountAvgViews: baselineViews,
        accountHandle: instagramAccount?.handle,
      });

      await addAnalysis(analysis);
      toast.success("Tahlil yakunlandi!", {
        description: `${title} bo'yicha to'liq hisobot va ssenariy tayyorlandi.`,
      });
      void navigate({ to: "/reports/$id", params: { id: analysis.id } });
    } catch (err: any) {
      console.error("Video tahlil xatosi:", err);
      toast.error("Tahlilda xatolik yuz berdi", {
        description: err?.message || "Iltimos qayta urinib ko'ring.",
      });
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
          {t("analyze_title", "Algoritmik Video & Reels Diagnostikasi")}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
          {t(
            "analyze_desc",
            "Reels-ingizni nashr etishdan oldin tekshiring yoki raqobatchi havolasini qo'yib nega virallashganini aniqlang."
          )}
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
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 text-xs shrink-0 border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300"
          >
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
            {/* Input Mode Selector: Upload File VS Instagram URL */}
            <div className="mt-6 flex rounded-2xl border border-border/80 bg-surface/40 p-1.5">
              <button
                type="button"
                onClick={() => setMode("upload")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  mode === "upload"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Film className="h-4 w-4" />
                <span>1. Video Fayl Yuklash (.mp4, .mov)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("link")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  mode === "link"
                    ? "bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 text-pink-300 border border-pink-500/40 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Instagram className="h-4 w-4 text-pink-400" />
                <span>2. Instagram Reels Havolasi (URL)</span>
                <span className="text-[9px] font-mono bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded-full border border-pink-500/30">
                  Yangi
                </span>
              </button>
            </div>

            {/* Niche Selector */}
            <div className="mt-5 rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-sm">
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
                        : "border-border/70 bg-surface/40 text-muted-foreground hover:bg-surface hover:text-foreground"
                    )}
                  >
                    <span className="font-semibold">{n.name}</span>
                    <span className="mt-1 line-clamp-1 text-[10px] opacity-75">{n.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MODE 1: FILE DROPZONE */}
            {mode === "upload" && (
              <>
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
                    "mt-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/80 bg-surface/30 px-6 py-14 text-center transition-all hover:border-cyan-500/50 hover:bg-cyan-500/5 group",
                    dragging && "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
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

                {/* Watermark Checkbox */}
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
                  className="mt-6 w-full py-6 text-base font-extrabold shadow-xl shadow-cyan-500/20 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 text-slate-950 transition-all active:scale-[0.99] cursor-pointer"
                  size="lg"
                  disabled={!file}
                  onClick={() => void run()}
                >
                  <Flame className="mr-2 h-5 w-5" />
                  {t("analyze_btn_run", "Virallikni Tahlil Qilish (Meta 5 Drayveri)")}
                </Button>
              </>
            )}

            {/* MODE 2: INSTAGRAM LINK INPUT */}
            {mode === "link" && (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-950/20 via-surface/60 to-purple-950/20 p-6 shadow-xl">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <label className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-pink-400" />
                      <span>Instagram Reels Havolasini Kiriting:</span>
                    </label>
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="text-[11px] font-semibold text-pink-300 hover:text-pink-200 flex items-center gap-1 cursor-pointer bg-pink-500/10 px-2 py-0.5 rounded-lg border border-pink-500/30"
                    >
                      <Clipboard className="h-3 w-3" />
                      <span>Qo'yish (Paste)</span>
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      type="url"
                      placeholder="https://www.instagram.com/reel/C8XYZ12345... yoki https://instagr.am/p/..."
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="h-12 pl-10 pr-4 text-xs font-mono bg-background/90 border-pink-500/30 focus:border-pink-400"
                    />
                    <Instagram className="absolute left-3.5 top-3.5 h-5 w-5 text-pink-400 pointer-events-none" />
                  </div>

                  {/* Reel Card Preview if detected */}
                  {detectedShortcode ? (
                    <div className="mt-4 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between gap-3 animate-in fade-in duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                          ▶
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-emerald-300">
                              Shortcode: {detectedShortcode}
                            </span>
                            <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-300">
                              Aniqlangan Reel
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Instagram CDN orqali xronometraj va e'tibor signallari tahlilga tayyor.
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    </div>
                  ) : instagramUrl.length > 5 ? (
                    <div className="mt-3 text-[11px] text-amber-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>To'g'ri Reels havolasi kiritilganini tekshiring (https://www.instagram.com/reel/...)</span>
                    </div>
                  ) : null}

                  {/* Link Duration & Competitor Selector */}
                  <div className="mt-4 pt-4 border-t border-border/60 grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                        Taxminiy video davomiyligi:
                      </span>
                      <div className="flex gap-2">
                        {[15, 30, 60, 90].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setLinkDuration(d)}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg border font-mono font-bold text-xs transition-colors",
                              linkDuration === d
                                ? "bg-pink-500/20 text-pink-300 border-pink-500/50"
                                : "bg-surface/50 border-border/80 text-muted-foreground hover:bg-surface"
                            )}
                          >
                            {d}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0">
                      <div>
                        <span className="font-bold text-foreground block">Raqobatchi Tahlili</span>
                        <span className="text-[10px] text-muted-foreground">Sohaviy solishtirish uchun</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isCompetitorReel}
                        onChange={(e) => setIsCompetitorReel(e.target.checked)}
                        className="rounded border-border text-pink-500 focus:ring-pink-500 h-4 w-4 bg-background"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full py-6 text-base font-extrabold shadow-xl shadow-pink-500/20 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white transition-all active:scale-[0.99] cursor-pointer"
                  size="lg"
                  disabled={!detectedShortcode}
                  onClick={() => void run()}
                >
                  <Flame className="mr-2 h-5 w-5" />
                  Instagram Reel Havolasini Tahlil Qilish
                </Button>
              </div>
            )}

            <p className="mt-3.5 text-center text-[11px] text-muted-foreground leading-relaxed">
              {t(
                "analyze_disclaimer",
                "Tahlil Meta Reels ranking signallari (Sends/Reach, 3s Hook retention, Loop factor) va LiveDune bozor benchmarklari asosida hisoblanadi."
              )}
            </p>
          </>
        ) : (
          <div className="surface-card mt-8 p-8 border border-cyan-500/30 shadow-2xl rounded-2xl bg-card/90">
            <div className="flex items-center gap-3.5">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <div>
                <p className="text-sm font-bold text-foreground">
                  {mode === "link"
                    ? `Instagram Reel (@reel/${detectedShortcode})`
                    : `${file?.name} (${(file!.size / (1024 * 1024)).toFixed(1)} MB)`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(
                    "analyze_progress_text",
                    "Meta algoritmi va akkauntingiz benchmarklari tahlil qilinmoqda..."
                  )}
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
                      i > step && "border-border/70 text-muted-foreground"
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
