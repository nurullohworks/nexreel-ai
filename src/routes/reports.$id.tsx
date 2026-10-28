import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Download,
  Flame,
  Globe2,
  Share2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { MetricBar } from "@/components/data/MetricBar";
import { ScoreRing } from "@/components/data/ScoreRing";
import { StatCard } from "@/components/data/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber, useAppStore } from "@/lib/app-store";
import { predictionAccuracy, reportService, REPORT_DISCLAIMER } from "@/lib/services";
import type { Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports/$id")({
  head: () => ({
    meta: [
      { title: "Meta & LiveDune Algoritmik Hisobot — NEXREEL AI" },
      {
        name: "description",
        content: "Meta reyting algoritmi va LiveDune bozor benchmarklari asosidagi to'liq virallik diagnostikasi hisoboti.",
      },
      { property: "og:title", content: "Meta & LiveDune Algoritmik Hisobot — NEXREEL AI" },
      { property: "og:description", content: "Instagram Reel’ingiz uchun aniq algoritmik tahlil va kamchiliklar hisoboti." },
    ],
  }),
  component: ReportPage,
});

const severityStyles: Record<Severity, string> = {
  high: "border-destructive/40 bg-destructive/10 text-destructive",
  medium: "border-warning/40 bg-warning/10 text-warning",
  low: "border-border bg-muted/40 text-muted-foreground",
};

function ReportPage() {
  const { id } = useParams({ from: "/reports/$id" });
  const { analyses, setActualViews } = useAppStore();
  const analysis = analyses.find((a) => a.id === id);
  const [actual, setActual] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  if (!analysis) {
    return (
      <AppShell>
        <div className="surface-card mx-auto max-w-md p-8 text-center">
          <h1 className="text-lg font-semibold">Hisobot topilmadi</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bu tahlil sizning ish maydoningizda mavjud emas.
          </p>
          <Button asChild className="mt-6">
            <Link to="/history">Tarixga qaytish</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const p = analysis.prediction;
  const meta = analysis.metaAlgorithm;
  const liveDune = analysis.liveDuneBenchmark;
  const deficiencies = analysis.exactDeficiencies || [];
  const accuracy = predictionAccuracy(analysis);
  const verdict = analysis.verdict.algorithmVerdict || (p.overall_score >= 80 ? "UCHADI" : p.overall_score >= 60 ? "O'RTACHA" : "UCHMAYDI");

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase">
            <Cpu className="h-4 w-4" />
            <span>Meta Algorithm & LiveDune Diagnostic Report</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{analysis.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {analysis.fileName} · {new Date(analysis.createdAt).toLocaleString()} · Davomiyligi: {analysis.durationSec}s
          </p>
        </div>
        <Button variant="outline" onClick={() => void reportService.export(analysis)}>
          <Download className="mr-1 h-4 w-4" /> PDF eksport
        </Button>
      </div>

      {/* 🚀 Algorithmic Verdict Hero Banner */}
      <div
        className={cn(
          "mt-6 rounded-2xl border p-6 shadow-xl transition-all backdrop-blur-sm",
          verdict === "UCHADI" && "border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-background shadow-emerald-500/10",
          verdict === "O'RTACHA" && "border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-background shadow-amber-500/10",
          verdict === "UCHMAYDI" && "border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-background shadow-rose-500/10",
        )}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl font-bold shadow-inner",
                verdict === "UCHADI" && "border-emerald-500/50 bg-emerald-500/20 text-emerald-400",
                verdict === "O'RTACHA" && "border-amber-500/50 bg-amber-500/20 text-amber-400",
                verdict === "UCHMAYDI" && "border-rose-500/50 bg-rose-500/20 text-rose-400",
              )}
            >
              {verdict === "UCHADI" ? <Flame className="h-7 w-7 text-emerald-400" /> : verdict === "O'RTACHA" ? <Zap className="h-7 w-7 text-amber-400" /> : <ShieldAlert className="h-7 w-7 text-rose-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Algoritm Hukmi:</span>
                <span
                  className={cn(
                    "font-mono font-bold text-sm px-2.5 py-0.5 rounded-full",
                    verdict === "UCHADI" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                    verdict === "O'RTACHA" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                    verdict === "UCHMAYDI" && "bg-rose-500/20 text-rose-300 border border-rose-500/30",
                  )}
                >
                  {verdict === "UCHADI" ? "🚀 UCHADI (VIRAL BO'LADI)" : verdict === "O'RTACHA" ? "⚠️ O'RTACHA QOLADI" : "🛑 UCHMAYDI / BLOKLANADI"}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{analysis.verdict.summary}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-center font-mono">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Algoritmik Ball</p>
              <p className="text-2xl font-bold text-foreground">{meta?.totalAlgorithmScore ?? p.overall_score}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Score Ring + Key Stats */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="surface-card flex flex-col items-center justify-center p-8 border border-border/80">
          <ScoreRing score={meta?.totalAlgorithmScore ?? p.overall_score} size={190} />
          <p className="mt-5 text-sm font-semibold text-foreground">
            {verdict === "UCHADI" ? "Eksponentsial Tarqatish Salohiyati" : verdict === "O'RTACHA" ? "Obunachilar Oralig'ida Cheklangan" : "Kam Qamrov Xavfi"}
          </p>
          <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
            Ushbu ball Meta reyting formulalari (DM Shares 35%, Loop 25%, 3s Hook 20%, Saves 10%) orqali hisoblangan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Kutilayotgan ko‘rishlar"
            value={`${formatNumber(p.estimated_view_min)} – ${formatNumber(p.estimated_view_max)}`}
          />
          <StatCard
            label="Taxminiy qamrov (Reach)"
            value={`${formatNumber(p.estimated_reach_min)} – ${formatNumber(p.estimated_reach_max)}`}
          />
          <StatCard label="Explore Virallik Ehtimoli" value={`${p.viral_probability}%`} />
          <StatCard label="Algoritmik Ishonch" value={`${p.confidence_score}%`} />

          <div className="surface-card p-5 sm:col-span-2 border border-border/80">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Algoritmik Xulosa & Risklar
            </h2>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <List title="Kuchli signallar" items={p.strengths} tone="text-success" />
              <List title="Zaif tomonlar" items={p.weaknesses} tone="text-warning" />
              <List title="Algoritmik to'siqlar" items={p.risk_factors} tone="text-destructive" />
            </div>
          </div>
        </div>
      </div>

      {/* 🛑 Exact Deficiencies & Second-by-second Actionable Fixes */}
      <section className="surface-card mt-6 p-6 border-warning/40 shadow-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h2 className="text-base font-bold text-foreground">
            Soniyalar Bo'yicha Aniq Kamchiliklar & Tuzatishlar (Uchishi uchun nima qilish kerak?)
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Meta algoritmi ushbu aniq nuqtalarda videoni jazolaydi. Joylashdan oldin ularni bartaraf eting:
        </p>

        <div className="mt-5 space-y-4">
          {deficiencies.map((def, idx) => (
            <div
              key={def.id || idx}
              className="rounded-xl border border-border/80 bg-background/50 p-4 transition-all hover:border-border"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    ⏱ {def.timestamp}
                  </span>
                  <span className="font-semibold text-sm text-foreground">{def.flaw}</span>
                </div>
                <span className={cn("text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border", severityStyles[def.severity])}>
                  {def.severity === "high" ? "Yuqori xavf" : def.severity === "medium" ? "O'rtacha" : "Tavsiya"}
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2 text-xs leading-relaxed">
                <div>
                  <span className="font-semibold text-rose-400">Nega Meta algoritmi to'xtatadi:</span>
                  <p className="mt-0.5 text-muted-foreground">{def.whyItFailsMetaAlgorithm}</p>
                </div>
                <div>
                  <span className="font-semibold text-emerald-400">Aniq nima qilish kerak (Yechim):</span>
                  <p className="mt-0.5 text-foreground/90 font-medium">{def.actionableFix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🧬 Meta 3-Stage Distribution Funnel */}
      {meta?.stages?.seedTest && meta?.stages?.lookalikeExpand && meta?.stages?.exploreViral && (
        <section className="surface-card mt-6 p-6 border border-border/80">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Meta Reels 3-Bosqichli Tarqatish Funneli (Funnel Test)
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Instagram har bir videoni 3 ta test bosqichidan o'tkazadi. Videongiz qaysi bosqichda to'xtashini ko'ring:
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {/* Stage 1 */}
            <div className={cn("rounded-xl border p-4 transition-all", meta.stages.seedTest?.passed ? "border-emerald-500/40 bg-emerald-500/5" : "border-rose-500/40 bg-rose-500/5")}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">1-Bosqich</span>
                {meta.stages.seedTest?.passed ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> O'tdi</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-400"><XCircle className="h-3.5 w-3.5" /> Xavf</span>
                )}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-foreground">{meta.stages.seedTest?.name}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{meta.stages.seedTest?.description}</p>
              <div className="mt-3 rounded-lg bg-background/60 p-2.5 text-[11px] text-foreground/85 font-medium border border-border/50">
                {meta.stages.seedTest?.note}
              </div>
            </div>

            {/* Stage 2 */}
            <div className={cn("rounded-xl border p-4 transition-all", meta.stages.lookalikeExpand?.passed ? "border-emerald-500/40 bg-emerald-500/5" : "border-amber-500/40 bg-amber-500/5")}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">2-Bosqich</span>
                {meta.stages.lookalikeExpand?.passed ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> O'tdi</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400"><AlertTriangle className="h-3.5 w-3.5" /> Cheklangan</span>
                )}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-foreground">{meta.stages.lookalikeExpand?.name}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{meta.stages.lookalikeExpand?.description}</p>
              <div className="mt-3 rounded-lg bg-background/60 p-2.5 text-[11px] text-foreground/85 font-medium border border-border/50">
                {meta.stages.lookalikeExpand?.note}
              </div>
            </div>

            {/* Stage 3 */}
            <div className={cn("rounded-xl border p-4 transition-all", meta.stages.exploreViral?.passed ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-card/40")}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">3-Bosqich</span>
                {meta.stages.exploreViral?.passed ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><Flame className="h-3.5 w-3.5" /> Explore</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground"><XCircle className="h-3.5 w-3.5" /> Yetib bormaydi</span>
                )}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-foreground">{meta.stages.exploreViral?.name}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{meta.stages.exploreViral?.description}</p>
              <div className="mt-3 rounded-lg bg-background/60 p-2.5 text-[11px] text-foreground/85 font-medium border border-border/50">
                {meta.stages.exploreViral?.note}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 📊 LiveDune Niche Benchmark Comparison */}
      {liveDune && (
        <section className="surface-card mt-6 p-6 border border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-base font-bold text-foreground">
                  LiveDune Bozor Solishtiruvi: {liveDune.nicheName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  LiveDune bazasidagi {liveDune.sampleAccountsCount.toLocaleString()} ta real akkaunt ko'rsatkichlari bilan taqqoslash
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Nisha o'rtacha ER: {liveDune.nicheAvgER}% · Top 10% Viral ER: {liveDune.top10ViralER}%
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveDune.benchmarks.map((b) => (
              <div key={b.metric} className="rounded-xl border border-border/80 bg-background/40 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{b.metric}</span>
                  <span
                    className={cn(
                      "font-mono font-bold text-[10px] px-1.5 py-0.5 rounded",
                      b.status === "ahead" && "bg-emerald-500/10 text-emerald-400",
                      b.status === "average" && "bg-amber-500/10 text-amber-400",
                      b.status === "behind" && "bg-rose-500/10 text-rose-400",
                    )}
                  >
                    {b.status === "ahead" ? "O'zib ketdi" : b.status === "average" ? "O'rtacha" : "Orqada"}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between font-mono">
                  <div>
                    <span className="text-xs text-muted-foreground">Sizda: </span>
                    <span className="text-base font-bold text-primary">{b.current}{b.unit}</span>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <span>O'rtacha: {b.nicheAvg}{b.unit}</span>
                    <span className="ml-2 text-emerald-400 font-semibold">Top 10%: {b.top10Percent}{b.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground/90 flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span><strong>LiveDune Ekspert Xulosasi:</strong> {liveDune.insight}</span>
          </div>
        </section>
      )}

      {/* Performance Breakdown Metrics */}
      <section className="surface-card mt-6 p-6 border border-border/80">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Batafsil Metrikalar Bahosi
        </h2>
        <div className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {analysis.metrics.map((m) => (
            <MetricBar key={m.key} label={m.label} score={m.score} />
          ))}
        </div>
      </section>

      {/* Timeline Analysis */}
      <section className="surface-card mt-6 p-6 border border-border/80">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Vaqt Tahlili (Timeline Retention)</h2>
        <div className="mt-6 flex gap-1 overflow-hidden rounded-lg">
          {analysis.timeline.map((seg) => (
            <div
              key={seg.label}
              className={cn(
                "h-2.5 rounded-full transition-all",
                seg.verdict === "Strong" && "bg-success",
                seg.verdict === "Good" && "bg-primary",
                seg.verdict === "Average" && "bg-warning",
                seg.verdict === "Weak" && "bg-destructive",
              )}
              style={{ flex: seg.to - seg.from }}
            />
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {analysis.timeline.map((seg) => (
            <div
              key={seg.label}
              className={cn(
                "rounded-lg border border-border bg-background/40 p-4",
                seg.verdict === "Weak" && "border-destructive/40 bg-destructive/5",
              )}
            >
              <p className="font-mono text-[11px] text-muted-foreground">
                {seg.from}s — {seg.to}s
              </p>
              <p className="mt-2 text-sm font-medium uppercase tracking-wide">{seg.label}</p>
              <p className={cn("mt-1 text-xs font-semibold", seg.verdict === "Weak" ? "text-destructive" : seg.verdict === "Strong" ? "text-success" : "text-muted-foreground")}>
                {seg.verdict}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="mt-6">
        <h2 className="text-xl font-bold">Joylashtirishdan oldin nimani o‘zgartirish kerak?</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {analysis.recommendations.map((r) => (
            <div key={r.id} className="surface-card p-6 border border-border/80">
              <span
                className={cn(
                  "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest",
                  severityStyles[r.severity],
                )}
              >
                {r.severity === "high" ? "yuqori" : r.severity === "medium" ? "o‘rta" : "past"} muhimlik
              </span>
              <h3 className="mt-4 font-semibold text-base">{r.title}</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Hozirgi holat" value={r.current} />
                <Row label="Tavsiya etiladi" value={r.recommended} />
                <Row label="Nima uchun muhim" value={r.why} />
              </dl>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-mono">
                <span className="text-muted-foreground">Ta’sir +{r.impact}</span>
                <span className="tabular-nums font-semibold">
                  {r.currentScore} <TrendingUp className="mx-1 inline h-3 w-3 text-primary" />{" "}
                  {r.potentialScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benchmark Graph */}
      <section className="surface-card mt-6 p-6 border border-border/80">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Kontentingizni benchmark bilan solishtiring
        </h2>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysis.benchmark}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="metric" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="reel" name="Sizning Reel’ingiz" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="accountAvg" name="Akkaunt o‘rtachasi" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benchmark" name="Kontent benchmark" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Accuracy Tracking */}
      <section className="surface-card mt-6 p-6 border border-border/80">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Bashorat Aniqligini Qayd Etish
          </h2>
          {analysis.actualViews && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary/80"
              onClick={() => {
                setIsEditing(true);
                setActual(String(analysis.actualViews));
              }}
            >
              Qayta kiritish / O‘zgartirish
            </Button>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Bashorat qilingan"
            value={`${formatNumber(p.estimated_view_min)} – ${formatNumber(p.estimated_view_max)}`}
          />
          <StatCard
            label="Haqiqiy natija"
            value={analysis.actualViews ? formatNumber(analysis.actualViews) : "— (Kiritilmagan)"}
          />
          <StatCard
            label="Aniqlik darajasi"
            value={
              accuracy
                ? `${accuracy.label} (${accuracy.percent}% aniqlik)`
                : "Kiritish kutilmoqda"
            }
          />
        </div>

        {!analysis.actualViews || isEditing ? (
          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground font-medium">
              Videongizni Instagram’ga joylagach, qancha ko‘rish (Views) yig‘ganini kiriting:
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                inputMode="numeric"
                placeholder="Masalan: 1850 yoki 2400"
                className="sm:max-w-xs bg-background"
              />
              <Button
                onClick={() => {
                  const v = Number(actual.replace(/\D/g, ""));
                  if (v > 0) {
                    setActualViews(analysis.id, v);
                    setIsEditing(false);
                    toast.success("Haqiqiy natija saqlandi!", {
                      description: `Aniqlik darajasi avtomatik hisoblandi.`,
                    });
                  } else {
                    toast.error("Iltimos, haqiqiy ko'rishlar sonini raqamda kiriting.");
                  }
                }}
              >
                Natijani Saqlash & Tekshirish
              </Button>
              {isEditing && (
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Bekor qilish
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border/70 bg-card/40 p-4">
            <p className="text-sm text-muted-foreground">
              {accuracy?.inRange
                ? `✅ A'lo daraja! Haqiqiy natijangiz (${formatNumber(analysis.actualViews)}) bashorat qilingan oraliqqa (${formatNumber(p.estimated_view_min)} – ${formatNumber(p.estimated_view_max)}) to'liq mos tushdi.`
                : `ℹ️ Haqiqiy natijangiz (${formatNumber(analysis.actualViews)}) kutilgan oraliqdan tashqarida bo'ldi. Bu modelni yanada aniqroq o'qitish uchun ishlatiladi.`}
            </p>
          </div>
        )}
      </section>

      {/* Bottom CTA & Optimize Banner */}
      <section className="surface-card mt-6 border-primary/50 p-8 shadow-2xl rounded-2xl bg-gradient-to-b from-card/80 to-card">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
          Joylashtirish bo‘yicha yakuniy xulosa
        </p>
        <h2 className="mt-3 text-3xl font-bold">{analysis.verdict.state}</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{analysis.verdict.summary}</p>
        
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="shadow-lg shadow-primary/25">
            <Link to="/analyze">
              Yangi Reel Tahlil Qilish <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            Yaxshilashlardan keyingi kutilayotgan ball:{" "}
            <span className="font-bold text-foreground">
              {p.overall_score} → {analysis.verdict.potentialScore}
            </span>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{REPORT_DISCLAIMER}</p>
      </section>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 leading-relaxed text-foreground/85">{value}</dd>
    </div>
  );
}

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div>
      <p className={cn("text-[11px] uppercase tracking-widest", tone)}>{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-foreground/85">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

