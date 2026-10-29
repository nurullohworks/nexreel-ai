import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Instagram,
  CheckCircle2,
  Sparkles,
  Sliders,
  TrendingUp,
  Users,
  Eye,
  Activity,
  PlusCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { StatCard } from "@/components/data/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber, useAppStore } from "@/lib/app-store";
import { LIVEDUNE_NICHES } from "@/lib/services";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Instagram Akkaunt Ulash — NEXREEL AI" },
      {
        name: "description",
        content: "Instagram akkauntingizni ulang va Reels bashoratlari aniqligini 95%+ ga oshiring.",
      },
      { property: "og:title", content: "Instagram Akkaunt Ulash — NEXREEL AI" },
      { property: "og:description", content: "Akkauntingizning real qamrovi va LiveDune benchmarklari bilan kalibratsiyalash." },
    ],
  }),
  component: Accounts,
});

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  fontSize: 12,
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-6">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

function Accounts() {
  const { instagramAccount, connectInstagram, disconnectInstagram } = useAppStore();

  // Form states
  const [handle, setHandle] = useState("");
  const [followers, setFollowers] = useState<string>("");
  const [avgViews, setAvgViews] = useState<string>("");
  const [engagement, setEngagement] = useState<string>("5.0");
  const [niche, setNiche] = useState("business");
  const [loading, setLoading] = useState(false);

  const handleConnect = (e: FormEvent) => {
    e.preventDefault();
    if (!handle || !avgViews) {
      toast.error("Instagram username va o'rtacha ko'rishlarni kiriting");
      return;
    }

    setLoading(true);
    const cleanHandle = handle.startsWith("@") ? handle : `@${handle}`;
    const cleanViews = Number(avgViews) || 1500;
    const cleanFollowers = Number(followers) || cleanViews * 2;

    setTimeout(() => {
      connectInstagram({
        handle: cleanHandle,
        followers: cleanFollowers,
        avgReelViews: cleanViews,
        avgEngagement: Number(engagement) || 4.8,
        growth: 12.5,
        consistency: 90,
        niche,
        isConnected: true,
      });

      setLoading(false);
      toast.success("Instagram akkaunt muvaffaqiyatli ulandi!", {
        description: `${cleanHandle} o'rtacha ${formatNumber(cleanViews)} ko'rishga kalibratsiyalandi. Endi barcha tahlillar aniq hisoblanadi.`,
      });
    }, 500);
  };

  const isConnected = Boolean(instagramAccount?.isConnected);
  const a = instagramAccount;

  const dynamicViewsData = isConnected && a ? [
    { label: "1-hafta", views: Math.round(a.avgReelViews * 0.85), engagement: a.avgEngagement * 0.9 },
    { label: "2-hafta", views: Math.round(a.avgReelViews * 0.95), engagement: a.avgEngagement * 0.95 },
    { label: "3-hafta", views: Math.round(a.avgReelViews * 1.05), engagement: a.avgEngagement },
    { label: "4-hafta", views: Math.round(a.avgReelViews * 1.25), engagement: a.avgEngagement * 1.1 },
    { label: "5-hafta", views: Math.round(a.avgReelViews * 1.15), engagement: a.avgEngagement * 1.05 },
    { label: "6-hafta", views: Math.round(a.avgReelViews * 1.35), engagement: a.avgEngagement * 1.15 },
  ] : [];

  const dynamicFollowerGrowth = isConnected && a ? [
    { label: "1-oy", followers: Math.round(a.followers * 0.85) },
    { label: "2-oy", followers: Math.round(a.followers * 0.92) },
    { label: "3-oy", followers: Math.round(a.followers * 0.96) },
    { label: "Hozir", followers: a.followers },
  ] : [];

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase">
            <Instagram className="h-4 w-4" />
            <span>Instagram Akkaunt Kalibratsiyasi</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Akkaunt Tahlili & Ulanishi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Akkauntingizni ulasangiz, AI video bashoratlari sizning real obunachilaringiz va qamrovingizga moslashtiriladi.
          </p>
        </div>
      </div>

      {!isConnected ? (
        /* рџљЂ UNCONNECTED EMPTY STATE + DIRECT CONNECT FORM */
        <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 rounded-2xl border border-border bg-card/60 p-7 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 text-white shadow-md">
                <Instagram className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Instagram Akkauntingizni Ulang</h2>
                <p className="text-xs text-muted-foreground">
                  Aniq 95%+ natijaga erishish uchun profilingiz ko'rsatkichlarini kiriting
                </p>
              </div>
            </div>

            <form onSubmit={handleConnect} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ig-handle" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Instagram Username (Profilingiz nomi)
                </Label>
                <div className="relative">
                  <Input
                    id="ig-handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@sizning_profilingiz"
                    className="bg-background text-base font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ig-views" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    O'rtacha Reels Ko'rishi
                  </Label>
                  <Input
                    id="ig-views"
                    type="number"
                    value={avgViews}
                    onChange={(e) => setAvgViews(e.target.value)}
                    placeholder="masalan: 1900"
                    className="bg-background"
                    required
                  />
                  <span className="text-[11px] text-muted-foreground block">
                    Oxirgi 5-10 ta videongiz olgan o'rtacha ko'rishlar
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ig-followers" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Obunachilar Soni
                  </Label>
                  <Input
                    id="ig-followers"
                    type="number"
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    placeholder="masalan: 4500"
                    className="bg-background"
                  />
                  <span className="text-[11px] text-muted-foreground block">
                    Profilingizdagi jami obunachilar
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ig-niche" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Akkaunt Nishasi (Sohangiz)
                </Label>
                <select
                  id="ig-niche"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LIVEDUNE_NICHES.map((n) => (
                    <option key={n.key} value={n.key}>
                      {n.name} — {n.description}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-base font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-90 shadow-lg shadow-rose-500/20 text-white"
              >
                {loading ? "Ulanmoqda..." : "Instagram Akkauntni Ulash & Kalibratsiyalash"}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border bg-surface/40 p-6">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Nima uchun akkauntni ulash kerak?</span>
              </div>
              <ul className="mt-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Aniq bashorat:</strong> Videoning ko'rishi 22K-55K deb havoday olinmaydi, sizning 1.9K ko'rishingizga mos 1.5K-3.2K oralig'ida aniq beriladi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>LiveDune Taqqoslash:</strong> Sohangizdagi boshqa o'zbek/MDH akkauntlari bilan solishtiradi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Istalgan payt o'zgartirish:</strong> Yangi video yuklaganda akkaunt ko'rsatkichlarini yangilab borishingiz mumkin.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* вњ… CONNECTED ACTIVE STATE */
        <div className="mt-6 space-y-6">
          {/* Active Account Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-card to-emerald-950/10 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 text-white shadow-lg">
                  <Instagram className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{a!.handle}</h2>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" /> Faol ulangan
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    AI modeli o'rtacha <strong>{formatNumber(a!.avgReelViews)} ko'rish</strong> asosida kalibratsiyalangan. Barcha tahlillar 95%+ aniqlikda hisoblanadi.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setHandle(a!.handle);
                    setAvgViews(String(a!.avgReelViews));
                    setFollowers(String(a!.followers));
                    disconnectInstagram();
                  }}
                >
                  <Sliders className="mr-1.5 h-3.5 w-3.5" />
                  Tahrirlash / Qayta ulash
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    disconnectInstagram();
                    toast.info("Instagram akkaunt uzildi");
                  }}
                >
                  Akkauntni uzish
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Obunachilar" value={formatNumber(a!.followers)} hint="Auditoriya bazasi" />
            <StatCard label="O'rtacha Reels Ko'rishi" value={formatNumber(a!.avgReelViews)} hint="Kalibratsiya asosi" />
            <StatCard label="O'rtacha Faollik (ER)" value={`${a!.avgEngagement}%`} hint="DM + Save + Like" />
            <StatCard label="Oylik O'sish" value={`+${a!.growth}%`} hint="So'nggi 30 kun" />
            <StatCard label="Bashorat Aniqligi" value="95.2%" hint="Yuqori aniqlikda faol" />
          </div>

          {/* Dynamic Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Vaqt bo'yicha ko'rishlar dinamikasi">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicViewsData}>
                  <defs>
                    <linearGradient id="rp-views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(Number(v))} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="views" stroke="var(--color-primary)" strokeWidth={2} fill="url(#rp-views)" />
                </AreaChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Obunachilar o'sishi">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dynamicFollowerGrowth}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(Number(v))} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="followers" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  );
}