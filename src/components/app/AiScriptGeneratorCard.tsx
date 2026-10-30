import { useState, useEffect } from "react";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Film,
  Music,
  Share2,
  Bookmark,
  Volume2,
  TrendingUp,
  Flame,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Analysis } from "@/lib/types";
import {
  ScriptGeneratorService,
  type GeneratedReelScript,
  type ViralHookItem,
  type ScriptBeatItem,
} from "@/lib/services/script-generator";

interface AiScriptGeneratorCardProps {
  analysis: Analysis;
}

export function AiScriptGeneratorCard({ analysis }: AiScriptGeneratorCardProps) {
  const [script, setScript] = useState<GeneratedReelScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    void loadScript();
  }, [analysis.id]);

  const loadScript = async () => {
    setLoading(true);
    try {
      const res = await ScriptGeneratorService.generateScript(analysis);
      setScript(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Nusxa olindi!", { description: text.slice(0, 50) + "..." });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const copyEntireScript = () => {
    if (!script) return;
    const fullText = `📌 REELS MAVZUSI: ${script.reelTitle}
━━━━━━━━━━━━━━━━━━━━
🎯 1. TANLANGAN VIRAL HOOK (0-3s):
"${script.hooks[0]?.hookText || ""}"
Kadr harakati: ${script.hooks[0]?.visualPrompt || ""}

━━━━━━━━━━━━━━━━━━━━
🎬 2. BOSQICHMA-BOSQICH SSENARIY:
${script.beats
  .map(
    (b) => `[${b.timestamp}] ${b.phase}
👁️ Kadr: ${b.visualCue}
🗣️ Gapirish matni: "${b.voiceoverText}"
⚡ Retention Hack: ${b.retentionHack}
`
  )
  .join("\n")}
━━━━━━━━━━━━━━━━━━━━
🔄 3. SEAMLESS LOOP:
${script.loopEndingLine}

🎵 Tavsiya qilingan musiqa: ${script.recommendedAudio}
📢 Chaqiruv (CTA): ${script.callToAction}

📝 Post matni (Caption):
${script.captionIdea}

${script.hashtags.join(" ")}
`;

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    toast.success("Butun ssenariy buferga nusxalandi!", {
      description: "Instagram yoki teleprompter ilovangizga qo'yib o'qishingiz mumkin.",
    });
    setTimeout(() => setCopiedAll(false), 3000);
  };

  if (!script && loading) {
    return (
      <div className="surface-card mt-6 p-8 border border-border/80 text-center space-y-3">
        <Sparkles className="h-8 w-8 text-cyan-400 mx-auto animate-spin" />
        <p className="text-sm font-bold text-foreground">
          AI Retentsion Ssenariy va 5 ta Viral Hook Yaratilmoqda...
        </p>
        <p className="text-xs text-muted-foreground">
          Meta algoritmi bo'yicha eng yuqori e'tibor tortuvchi kadrma-kadr matn hisoblanmoqda.
        </p>
      </div>
    );
  }

  if (!script) return null;

  return (
    <section className="surface-card mt-6 border border-cyan-500/30 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-card to-background shadow-2xl relative overflow-hidden">
      <div className="halo pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold text-cyan-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>AI SSENARIY & HOOK GENERATOR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Virallikni 3x Oshiruvchi Qayta Ishlangan Ssenariy
          </h2>
          <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
            Videongizdagi aniqlangan kamchiliklar o'rniga Meta algoritmining eng yuqori signallari (DM Shares, 3s Hook, Seamless Loop) asosida tuzilgan tayyor ssenariy.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={loadScript}
            className="h-9 text-xs border-border/80 hover:bg-surface-2"
          >
            <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Qayta Yaratish
          </Button>

          <Button
            size="sm"
            onClick={copyEntireScript}
            className="h-9 text-xs font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 text-slate-950 shadow-md shadow-cyan-500/20"
          >
            {copiedAll ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-slate-950" /> Nusxalandi!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" /> To'liq Ssenariyni Olish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 1. Viral Hooks (0-3s) */}
      <div className="mt-7 relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Flame className="h-4 w-4 text-emerald-400" />
            <span>0-3s Killer Hook Variantlari (Boshlang'ich E'tibor)</span>
          </h3>
          <span className="text-[11px] text-muted-foreground font-mono">
            Birini tanlab videongiz boshida ayting
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {script.hooks.map((h) => (
            <div
              key={h.id}
              className="rounded-xl border border-border/80 bg-surface/50 p-4 flex flex-col justify-between hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-300">
                    {h.categoryLabel}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    {h.retentionBoost}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground leading-snug">
                  "{h.hookText}"
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground/80 leading-relaxed italic">
                  👁️ {h.visualPrompt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-[11px] hover:text-cyan-400"
                  onClick={() => copyToClipboard(h.hookText, h.id)}
                >
                  {copiedId === h.id ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="h-3 w-3" /> Nusxalandi
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="h-3 w-3" /> Nusxa olish
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Chronological Script Beats */}
      <div className="mt-8 relative z-10">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3.5">
          <Film className="h-4 w-4 text-cyan-400" />
          <span>Kadrma-kadr To'liq Xronologik Ssenariy</span>
        </h3>

        <div className="space-y-3">
          {script.beats.map((beat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/80 bg-surface/40 p-4 hover:border-border transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    {beat.timestamp}
                  </span>
                  <span className="text-xs font-bold text-foreground">{beat.phase}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">
                  ⚡ {beat.retentionHack}
                </span>
              </div>

              <div className="grid gap-2.5 md:grid-cols-2 text-xs">
                <div className="rounded-lg bg-background/50 p-2.5 border border-border/50">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    👁️ Kadr / Vizual Harakat:
                  </span>
                  <p className="text-foreground leading-relaxed">{beat.visualCue}</p>
                </div>

                <div className="rounded-lg bg-cyan-950/20 p-2.5 border border-cyan-500/20">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 block mb-1">
                    🗣️ Gapirish Matni (Audio):
                  </span>
                  <p className="text-cyan-100 font-medium leading-relaxed italic">
                    "{beat.voiceoverText}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Loop & Bonus Tips */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 relative z-10">
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-1.5">
            <RotateCcw className="h-4 w-4" />
            <span>Seamless Loop (Cheksiz Aylanma) Yakuni:</span>
          </div>
          <p className="text-xs text-foreground/90 italic leading-relaxed">
            "{script.loopEndingLine}"
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
            💡 Ushbu so'z video tugaganida birinchi hook jumlasiga to'g'ridan-to'g'ri ulanib ketadi. Tomoshabin video tugaganini bilmay 2-marta ko'radi (Loop koeffitsienti 1.25x+).
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface/40 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1.5">
            <Music className="h-4 w-4 text-emerald-400" />
            <span>Tavsiya Etilgan Musiqa & Chaqiruv (CTA):</span>
          </div>
          <p className="text-xs text-cyan-300 font-mono">
            🎵 {script.recommendedAudio}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            📢 <strong>CTA:</strong> {script.callToAction}
          </p>
        </div>
      </div>
    </section>
  );
}
