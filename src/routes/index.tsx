import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, AudioLines, Check, Eye, Gauge, MessageCircleMore, Play, Repeat2, RotateCcw, ShieldCheck, Sparkles, Terminal, TimerReset, X, Zap } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "NEXREEL AI — Reels uchun aniq tahlil natijasi" },
    { name: "description", content: "Reels video tuzilmasi, hook, retention va auditoriya signallari bo‘yicha aniq tahlil natijasini oling." },
    { property: "og:title", content: "NEXREEL AI — Cyber Command Deck" },
    { property: "og:description", content: "Instagram’ning ochiq signallari bo‘yicha Reels tahlili, kadrlar xaritasi va amaliy tavsiyalar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Landing,
});

const terminalLines = [
  { code: "SYS", text: "Namuna video qabul qilindi", tone: "text-signal" },
  { code: "KADR", text: "Video tuzilmasi tekshirilmoqda...", tone: "text-primary" },
  { code: "HOOK", text: "0–3s: kuchli kirish aniqlandi", tone: "text-signal" },
  { code: "LOOP", text: "Yakun va boshlanish mosligi tekshirildi", tone: "text-primary" },
  { code: "OK", text: "Aniq tahlil natijasi shakllandi", tone: "text-success" },
];
const comparisons = [
  ["Qaror manbai", "Subyektiv fikr", "Kontent signallari"],
  ["Hook tekshiruvi", "Umumiy taassurot", "0–3 soniya tahlili"],
  ["Kamchiliklar", "Tarqoq qaydlar", "Vaqt bo‘yicha xarita"],
  ["Keyingi qadam", "Sinab ko‘rish", "Ustuvor tavsiyalar"],
];
const drivers = [
  { id: "01", title: "DM ulashish signali", body: "Do‘stga yuborish qiymati: kontent suhbat boshlaydimi, fikr uyg‘otadimi va boshqalarga foyda beradimi?", icon: MessageCircleMore, score: 88 },
  { id: "02", title: "0–3s Hook kuchi", body: "Birinchi kadr, kirish matni va diqqatni ushlash kuchi.", icon: Zap, score: 92 },
  { id: "03", title: "Retention & pacing", body: "Sahna almashuvi va tomoshabinni ushlab turadigan tuzilma.", icon: TimerReset, score: 84 },
  { id: "04", title: "Loop & qayta ko‘rish", body: "Video yakuni va boshlanishining uzluksiz bog‘lanishi.", icon: Repeat2, score: 79 },
  { id: "05", title: "Saqlash & qiymat", body: "Auditoriya uchun foyda, original g‘oya va aniq mazmun.", icon: Sparkles, score: 86 },
];

function Landing() {
  return (
    <div className="home-deck min-h-screen bg-background text-foreground selection:bg-primary/30">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="command-grid pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 md:pb-14 md:pt-14">
            <div className="flex flex-col justify-between gap-6 border-b border-primary/25 pb-7 md:flex-row md:items-end">
              <div>
                <p className="mb-3 flex items-center gap-2 font-mono text-[10px] text-signal"><span className="h-1.5 w-1.5 rounded-full bg-signal" /> REELS KONTENT INTELLEKTI / 01</p>
                <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">NEXREEL <span className="text-primary">AI</span></h1>
                <p className="mt-3 font-display text-xl font-medium md:text-2xl">Joylashdan oldin. Aniq tahlil natijasi.</p>
              </div>
              <div className="max-w-sm md:text-right">
                <p className="text-sm leading-6 text-muted-foreground">Hook, video tuzilmasi va auditoriya signallarini yagona boshqaruv markazida tekshiring.</p>
                <div className="mt-4 flex flex-wrap gap-2 md:justify-end">
                  <Button asChild size="lg" className="font-semibold"><Link to="/analyze">Videoni tahlil qilish <ArrowRight /></Link></Button>
                  <Button asChild variant="outline" size="lg"><a href="#drivers">5 drayver <Gauge /></a></Button>
                </div>
              </div>
            </div>
            <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-3">
              <LiveTerminal />
              <SignalCore />
              <div id="comparison" className="command-panel overflow-hidden rounded-lg">
                <div className="border-b border-border px-5 py-4"><h2 className="font-display text-sm font-semibold">Eski usul vs <span className="text-primary">NEXREEL AI</span></h2><p className="mt-1 text-[11px] text-muted-foreground">Qarorlarni dalil bilan asoslang.</p></div>
                <table className="w-full table-fixed text-left text-[11px]">
                  <caption className="sr-only">Eski usul va NEXREEL AI taqqoslash jadvali</caption>
                  <thead className="bg-surface/70 text-muted-foreground"><tr><th className="p-3 font-medium">Mezon</th><th className="p-3 font-medium">Eski usul</th><th className="p-3 font-medium text-primary">NEXREEL AI</th></tr></thead>
                  <tbody>{comparisons.map(([label, oldWay, newWay]) => <tr key={label} className="border-t border-border/70"><th scope="row" className="p-3 font-medium">{label}</th><td className="p-3 text-muted-foreground"><X className="mb-1 h-3 w-3 text-destructive" />{oldWay}</td><td className="p-3 text-signal"><Check className="mb-1 h-3 w-3" />{newWay}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-border pt-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-signal" />Ochiq Instagram signallari asosida</span>
              <span>Namuna tahlil · real akkaunt statistikasi emas</span>
              <span className="font-mono text-primary">NEX_CORE / TAYYOR</span>
            </div>
          </div>
        </section>
        <section id="drivers" className="border-b border-border py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div><p className="font-mono text-[10px] text-primary">SIGNAL ARXITEKTURASI</p><h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">Meta · 5 drayver. Bitta tahlil.</h2></div>
              <p className="max-w-sm text-xs leading-5 text-muted-foreground">Ochiq hujjatlashtirilgan signallar va video ma’lumotlari. Meta’ning xususiy algoritmiga kirish da’vo qilinmaydi.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {drivers.map((driver, index) => <article key={driver.id} className={`command-panel rounded-lg p-5 transition-transform motion-safe:hover:-translate-y-1 ${index === 0 ? "md:row-span-2 lg:col-span-2" : "lg:col-span-2"}`}>
                <div className="flex items-center justify-between"><driver.icon className={`h-6 w-6 ${index === 0 ? "text-primary" : "text-signal"}`} /><span className="font-mono text-[10px] text-muted-foreground">DRAYVER_{driver.id}</span></div>
                <h3 className={`mt-5 font-display font-semibold ${index === 0 ? "text-2xl" : "text-base"}`}>{driver.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{driver.body}</p>
                {index === 0 && <div className="my-7 flex items-center justify-center"><LogoMark className="h-20 w-20" /></div>}
                <div className="mt-5 flex items-center justify-between border-t border-border pt-3"><span className="font-mono text-[9px] text-muted-foreground">NAMUNA BALI</span><span className="font-mono text-sm text-signal">{driver.score}<span className="text-muted-foreground"> / 100</span></span></div>
              </article>)}
            </div>
          </div>
        </section>
        <section className="py-14 md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center">
            <div><p className="font-mono text-[10px] text-primary">KEYINGI QADAM / YUKLASH</p><h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">Keyingi Reels’ni kuchliroq tayyorlang.</h2><p className="mt-3 text-sm text-muted-foreground">Aniq tahlil natijasi — kadrlar xaritasi va ustuvor tavsiyalar bilan.</p></div>
            <Button asChild size="lg"><Link to="/analyze">Tahlilni boshlash <Play /></Link></Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function LiveTerminal() {
  const [visibleCount, setVisibleCount] = useState(1);
  const [run, setRun] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setVisibleCount(terminalLines.length); return; }
    setVisibleCount(1);
    const timer = window.setInterval(() => setVisibleCount(count => Math.min(count + 1, terminalLines.length)), 1100);
    return () => window.clearInterval(timer);
  }, [run]);
  return <div className="command-panel relative flex min-h-[330px] flex-col overflow-hidden rounded-lg p-5">
    <div className="scanline absolute left-0 top-0 h-px w-full" />
    <div className="flex items-center justify-between border-b border-border pb-3"><div><h2 className="flex items-center gap-2 font-mono text-[10px] text-signal"><Terminal className="h-3.5 w-3.5" /> JONLI TAHLIL TERMINALI</h2><p className="mt-1 text-[10px] text-muted-foreground">reel_namuna.mp4 · 22s</p></div><Button variant="ghost" size="icon" className="h-7 w-7" title="Namuna tahlilni qayta ko‘rsatish" aria-label="Namuna tahlilni qayta ko‘rsatish" onClick={() => setRun(value => value + 1)}><RotateCcw /></Button></div>
    <div className="mt-5 flex-1 space-y-4 font-mono text-[10px]">{terminalLines.map((line, index) => <div key={line.code} className={`flex gap-2 transition-opacity duration-500 ${index < visibleCount ? "opacity-100" : "opacity-0"}`}><span className={line.tone}>[{line.code}]</span><span className="text-foreground/80">{line.text}</span></div>)}<span className="block text-primary motion-safe:animate-pulse">▍</span></div>
    <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-[9px] text-muted-foreground"><span>Namoyish rejimi</span><span className="text-signal">{visibleCount === terminalLines.length ? "YAKUNLANDI" : "TAHLIL QILINMOQDA"}</span></div>
  </div>;
}

function SignalCore() {
  return <div className="relative flex min-h-[330px] flex-col items-center justify-center overflow-hidden">
    <div className="absolute h-72 w-72 rounded-full border border-dashed border-signal/25 motion-safe:animate-[spin_30s_linear_infinite]" />
    <div className="absolute h-60 w-60 rounded-full border border-primary/25" />
    <div className="signal-ring relative flex h-48 w-48 flex-col items-center justify-center rounded-full border-2 border-primary/60 bg-background">
      <div className="absolute inset-3 rounded-full border border-signal/40" /><Eye className="mb-2 h-4 w-4 text-signal" /><span className="font-display text-5xl font-semibold">92<span className="text-lg text-primary">/100</span></span><span className="mt-2 font-mono text-[9px] text-primary">UMUMIY TAHLIL BALI</span>
    </div>
    <div className="relative mt-9 flex gap-5 text-center"><div><p className="font-mono text-base text-signal">92</p><p className="text-[9px] text-muted-foreground">Hook</p></div><div><p className="font-mono text-base text-primary">84</p><p className="text-[9px] text-muted-foreground">Retention</p></div><div><p className="font-mono text-base text-signal">88</p><p className="text-[9px] text-muted-foreground">Ulashish</p></div></div>
    <AudioLines className="absolute top-4 h-4 w-4 text-signal" />
  </div>;
}
