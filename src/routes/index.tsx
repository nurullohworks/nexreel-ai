import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import {
  ArrowRight,
  Flame,
  Sparkles,
  Upload,
  Zap,
  CheckCircle2,
  Layers,
  Radio,
  Share2,
  Clock,
  ChevronRight,
  Database,
  Sliders,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXREEL AI — Instagram Reels Neyron Audit & Aniq Algoritmik Tahlil" },
      {
        name: "description",
        content:
          "Meta Reels algoritmi (DM Shares, 3s Hook, Retention) va LiveDune bozor benchmarklari asosida 100% aniq algoritmik tahlil natijalari va video diagnostikasi.",
      },
      { property: "og:title", content: "NEXREEL AI — Instagram Reels Aniq Tahlil Tizimi" },
      {
        property: "og:description",
        content:
          "Taxminlarsiz, aniq matematik va neyron tahlil: Meta 5-drayver ko'rsatkichlari, soniyalar bo'yicha kamchiliklar va qamrov natijasi.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const metaSignals = [
    {
      icon: Zap,
      code: "SIG-01",
      name: t("driver_sig1_name", "0-3s Hook Neyron Kuchi"),
      score: "94%",
      status: "Optimal",
      desc: t("driver_sig1_desc", "Ilk 3 soniyadagi dinamik harakat, ovoz balandligi va matn kontrasti tahlili."),
    },
    {
      icon: Share2,
      code: "SIG-02",
      name: t("driver_sig2_name", "DM Shares per Reach (Meta #1)"),
      score: "89%",
      status: "Yuqori",
      desc: t("driver_sig2_desc", "Tomoshabin videoni do'stiga yuborish ehtimoli va rezonans darajasi."),
    },
    {
      icon: Clock,
      code: "SIG-03",
      name: t("driver_sig3_name", "Qayta Ko'rish (Loop Faktor)"),
      score: "91%",
      status: "Mukammal",
      desc: t("driver_sig3_desc", "Video oxiri va boshi uzluksiz ulanishi hamda to'liq ko'rish indeksi."),
    },
    {
      icon: Layers,
      code: "SIG-04",
      name: t("driver_sig4_name", "Visual Pacing & B-Roll Dinamikasi"),
      score: "88%",
      status: "Yuqori",
      desc: t("driver_sig4_desc", "Har 1.8-2.2 soniyada kadrlar almashinuvi va tomoshabin diqqatini ushlab turish."),
    },
    {
      icon: Database,
      code: "SIG-05",
      name: t("driver_sig5_name", "LiveDune Bozor Benchmarki"),
      score: "96%",
      status: "Top 5%",
      desc: t("driver_sig5_desc", "O'zbekiston va MDH hududidagi 250,000+ muvaffaqiyatli reelslar bilan solishtirish."),
    },
  ];

  const comparisonData = [
    {
      feature: t("comp_row1_feat", "Tahlil Asosi"),
      oldWay: t("comp_row1_old", "Subyektiv fikr va noaniq taxminlar"),
      nexreel: t("comp_row1_new", "Meta rasmiy drayverlari & LiveDune bazasi"),
    },
    {
      feature: t("comp_row2_feat", "Xatolik Qidirish"),
      oldWay: t("comp_row2_old", "Umumiy 'videongiz yaxshi chiqmabdi'"),
      nexreel: t("comp_row2_new", "Aniq soniya va kadr skrinshoti bilan"),
    },
    {
      feature: t("comp_row3_feat", "Qamrov Bashorati"),
      oldWay: t("comp_row3_old", "Tavakkal va tasodifiy omad"),
      nexreel: t("comp_row3_new", "Akkaunt statistikasi bilan 95%+ aniqlik"),
    },
    {
      feature: t("comp_row4_feat", "Tuzatish Rejasi"),
      oldWay: t("comp_row4_old", "Nima qilishni o'zingiz o'ylaysiz"),
      nexreel: t("comp_row4_new", "Kadr-ba-kadr professional montaj ssenariysi"),
    },
  ];

  const useCases = [
    {
      title: t("target_u1_title", "Ekspertlar & Shaxsiy Brendlar"),
      desc: t("target_u1_desc", "O'z sohangizda ishonchli auditoriya yig'ish va har bir videodan mijozlar oqimini jalb qilish."),
    },
    {
      title: t("target_u2_title", "Mobilograflar & Montajchilar"),
      desc: t("target_u2_desc", "Mijozlarga 'menimcha yaxshi' emas, 100% matematik dalillar bilan tahlil taqdim etish."),
    },
    {
      title: t("target_u3_title", "SMM Agentliklari & Media"),
      desc: t("target_u3_desc", "Barcha loyihalar uchun qat'iy sifat nazorati va kafolatlangan yuqori ko'rishlar soni."),
    },
    {
      title: t("target_u4_title", "Biznes & Mahsulot Egalari"),
      desc: t("target_u4_desc", "Katta reklama byudjetlarisiz organik qamrov orqali sotuvlarni bir necha barobarga oshirish."),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cyan-500/30 selection:text-cyan-200">
      <SiteHeader />

      {/* Hero Section — Cyber Command Deck */}
      <section className="relative overflow-hidden border-b border-border/70 pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="halo pointer-events-none absolute inset-0 opacity-60" />
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            
            {/* Left Column: Mission & Headline */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-cyan-300 backdrop-blur-md">
                <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                <span>{t("hero_engine", "NEXREEL NEURAL ENGINE v3.4")}</span>
                <span className="hidden sm:inline text-muted-foreground">·</span>
                <span className="hidden sm:inline text-emerald-400 font-bold">{t("hero_badge", "100% MATEMATIK TAHLIL")}</span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
                {t("hero_title_1", "Taxminlarni unuting.")} <br />
                <span className="gradient-text">{t("hero_title_2", "Aniq Algoritmik")} {t("hero_title_3", "Tahlil Natijasi.")}</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg font-medium text-foreground/90 leading-relaxed max-w-xl">
                {t("hero_desc", "Instagram Reels videongizni joylashdan oldin to'liq neyron tekshiruvdan o'tkazing. Meta reyting drayverlari va LiveDune bozor benchmarklari asosida soniyalar bo'yicha kamchiliklarni aniqlang.")}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold py-6 px-8 text-sm shadow-xl shadow-cyan-500/20 hover:opacity-95"
                >
                  <Link to="/analyze">
                    <Upload className="mr-2 h-4 w-4" /> {t("hero_cta_analyze", "Videoni Tahlil Qilish")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-border/80 text-xs font-semibold py-6 px-6 hover:bg-surface-2"
                >
                  <Link to="/accounts">
                    <Sliders className="mr-2 h-4 w-4 text-cyan-400" /> {t("hero_cta_connect", "Akkaunt Kalibratsiyasi")}
                  </Link>
                </Button>
              </div>

              {/* Hardware / Engine Specs Bar */}
              <div className="mt-10 grid grid-cols-3 gap-3 border-t border-border/60 pt-6">
                <div>
                  <p className="text-xl font-extrabold font-mono text-cyan-400">500 MB</p>
                  <p className="text-[11px] text-muted-foreground">{t("hero_spec_size", "Video Sig'imi (4K/60fps)")}</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold font-mono text-emerald-400">5 Drayver</p>
                  <p className="text-[11px] text-muted-foreground">{t("hero_spec_drivers", "Meta Rasmiy Signallari")}</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold font-mono text-foreground">250K+</p>
                  <p className="text-[11px] text-muted-foreground">{t("hero_spec_benchmark", "LiveDune Benchmark Bazasi")}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Neural Diagnostic Terminal UI */}
            <div className="relative">
              <div className="relative rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-border/80 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                      {t("diag_core_title", "AUDIT-CORE // reel_diagnostika_pro.mp4")}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                    <Flame className="h-3 w-3" /> {t("diag_verdict_fly", "UCHADI (94/100)")}
                  </div>
                </div>

                {/* Score Summary Block */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border/60 bg-surface/60 p-2.5 text-center">
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">{t("diag_overall_score", "Umumiy Ball")}</p>
                    <p className="mt-1 font-mono text-xl font-black text-cyan-400">94 / 100</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-surface/60 p-2.5 text-center">
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">{t("diag_explore_chance", "Explore Imkoniyati")}</p>
                    <p className="mt-1 font-mono text-xl font-black text-emerald-400">92%</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-surface/60 p-2.5 text-center">
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">{t("diag_reach_result", "Qamrov Natijasi")}</p>
                    <p className="mt-1 font-mono text-base font-black text-foreground">3.2K – 5.8K</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-surface/60 p-2.5 text-center">
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">{t("diag_confidence", "Tahlil Ishonchi")}</p>
                    <p className="mt-1 font-mono text-xl font-black text-cyan-300">98.5%</p>
                  </div>
                </div>

                {/* Live Diagnostic Metrics */}
                <div className="mt-5 space-y-2.5">
                  <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {t("diag_drivers_title", "Meta Algoritm Drayverlari Ko'rsatkichi")}
                  </p>
                  
                  {metaSignals.slice(0, 4).map((sig) => (
                    <div key={sig.code} className="rounded-lg border border-border/50 bg-surface-2/40 p-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground/90">{sig.name}</span>
                        <span className="font-mono font-bold text-cyan-400">{sig.score}</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                          style={{ width: sig.score }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instant Timeline Diagnosis Sample */}
                <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
                  <div className="flex items-start gap-2.5">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <div className="text-[11px] leading-relaxed text-cyan-100/90">
                      <strong className="text-cyan-300">{t("diag_rec_title", "Neyron Tavsiya (00:04):")}</strong>{" "}
                      {t("diag_rec_desc", "Dinamika 1.4 soniyaga sekinlashgan. Ovoz effektini (SFX) kuchaytirish orqali tomoshabin ushlab qolish darajasini yana +14% ga oshirish mumkin.")}
                    </div>
                  </div>
                </div>

                {/* Terminal Bottom Action */}
                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {t("diag_status_done", "STATUS: DIAGNOSTIKA TO'LIQ YAKUNLANDI")}
                  </span>
                  <Link to="/analyze" className="text-xs font-bold text-cyan-400 hover:underline inline-flex items-center">
                    {t("diag_check_own", "O'z videongizni tekshiring")} <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 2 — 1-Click Quick Dropzone on Homepage */}
      <section className="border-b border-border/70 bg-surface/30 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            {t("drop_badge", "TEZKOR ISHGA TUSHIRISH")}
          </span>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            {t("drop_title", "Reels Videongizni Hozir Tekshirib Ko'ring")}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            {t("drop_desc", "Hech qanday murakkab ro'yxatdan o'tishlarsiz, 500MB gacha bo'lgan faylingizni tashlang va bir zumda aniq tahlil natijasiga ega bo'ling.")}
          </p>

          <div
            onClick={() => navigate({ to: "/analyze" })}
            className="mt-8 cursor-pointer rounded-2xl border-2 border-dashed border-cyan-500/40 bg-card/60 p-8 sm:p-12 hover:border-cyan-400 hover:bg-cyan-500/5 transition-all group"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Upload className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              {t("drop_box_title", "Videoni bu yerga tashlang yoki tanlang")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              {t("drop_box_sub", "MP4, MOV, WebM · 500MB gacha · 100% Maxfiy va Xavfsiz")}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md">
              <Sparkles className="h-3.5 w-3.5" /> {t("drop_btn_scan", "Aniq Algoritmik Skanerlashni Boshlash")}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Comparison: Eski Usul vs NEXREEL AI */}
      <section className="border-b border-border/70 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              {t("comp_badge", "FARQNI KO'RING")}
            </span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-4xl">
              {t("comp_title", "Eski Usuldagi Taxminlar vs NEXREEL AI")}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {t("comp_desc", "Nimaga muvaffaqiyatli rilskreytorlar va yirik agentliklar tavakkal qilmasdan, aniq matematik tahlilga tayanadi?")}
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-border/80 bg-surface/50 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-border/70 bg-surface-2/60 p-4 font-mono text-xs font-bold text-muted-foreground">
              <div className="hidden md:block">{t("comp_col_feature", "MEZON / XUSUSIYAT")}</div>
              <div className="text-red-400 flex items-center gap-1.5">{t("comp_col_old", "❌ Eski Usul (Noaniq Taxminlar)")}</div>
              <div className="text-cyan-400 flex items-center gap-1.5">{t("comp_col_nexreel", "⚡ NEXREEL AI (Aniq Tahlil Natijasi)")}</div>
            </div>

            <div className="divide-y divide-border/60">
              {comparisonData.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 sm:p-5 text-xs transition-colors hover:bg-surface-2/30">
                  <div className="font-semibold text-foreground/90 font-mono text-[11px] uppercase text-muted-foreground md:text-foreground">
                    {row.feature}
                  </div>
                  <div className="text-muted-foreground line-through opacity-70">
                    {row.oldWay}
                  </div>
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {row.nexreel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Bento Grid: Meta 5-Drayver & LiveDune Arxitekturasi */}
      <section className="border-b border-border/70 py-16 md:py-24 bg-surface/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              {t("drivers_badge", "TEXNOLOGIYA & METODIKA")}
            </span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-4xl">
              {t("drivers_title", "Har Bir Soniyani Tahlil Qiluvchi 5 Ta Reyting Drayveri")}
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {metaSignals.map((sig) => (
              <div
                key={sig.code}
                className="surface-card p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                      <sig.icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {sig.code}
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-foreground">{sig.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{sig.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono">Standart:</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">{sig.status}</span>
                </div>
              </div>
            ))}

            {/* Final Callout Card in Grid */}
            <div className="surface-card p-6 flex flex-col justify-between bg-gradient-to-br from-cyan-950/30 to-emerald-950/30 border-cyan-500/30">
              <div>
                <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {t("drivers_guarantee_badge", "KAFOLAT")}
                </span>
                <h3 className="mt-4 text-base font-extrabold text-foreground">
                  {t("drivers_guarantee_title", "Joylashdan Oldin 100% Aniq Natija")}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t("drivers_guarantee_desc", "NEXREEL AI tahlilidan o'tgan videolar o'rtacha 3.8x ko'proq qamrov va 4.2x ko'proq DM ulashishlar hosil qiladi.")}
                </p>
              </div>

              <Button asChild className="mt-6 w-full font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950">
                <Link to="/analyze">{t("drivers_guarantee_btn", "Hozir Tekshirish")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Who is it for */}
      <section className="border-b border-border/70 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
            {t("target_badge", "Platforma Kimlar Uchun Mo'ljallangan?")}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((u) => (
              <div
                key={u.title}
                className="rounded-xl border border-border/70 bg-card/60 p-5 text-left hover:border-cyan-500/30 transition-colors"
              >
                <h4 className="text-sm font-bold text-foreground">{u.title}</h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Bottom High-Impact CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="halo pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl tracking-tight">
            {t("bottom_cta_title", "Videolaringizni professional darajaga olib chiqing.")}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
            {t("bottom_cta_desc", "Instagram Reels algoritmining barcha talablarini joylashdan oldin to'liq qondiring.")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold py-6 px-8 text-sm shadow-xl shadow-cyan-500/20"
            >
              <Link to="/analyze">{t("bottom_cta_btn1", "Birinchi Videoni Tahlil Qilish")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-xs font-semibold py-6 px-6"
            >
              <Link to="/pricing">{t("bottom_cta_btn2", "Tariflar & To'lov")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
