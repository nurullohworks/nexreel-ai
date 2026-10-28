import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

const columns: { title: string; items: { label: string; to?: string; href?: string }[] }[] = [
  {
    title: "Mahsulot",
    items: [
      { label: "Video Tahlil", to: "/analyze" },
      { label: "Instagram Akkaunt", to: "/accounts" },
      { label: "Tariflar", to: "/pricing" },
      { label: "Tahlillar Tarixi", to: "/history" },
      { label: "Admin Panel (PIN)", to: "/admin" },
    ],
  },
  {
    title: "Algoritmlar",
    items: [
      { label: "Meta Reels 5 Drayveri" },
      { label: "LiveDune Bozor Benchmarki" },
      { label: "Gemini 2.0 Flash Dvigateli" },
    ],
  },
  {
    title: "Huquqiy & Aloqa",
    items: [
      { label: "Maxfiylik siyosati" },
      { label: "Foydalanish shartlari" },
      { label: "Aloqa: @pray_boy", href: "https://t.me/pray_boy" },
      { label: "Tel: +998 93 760 77 27", href: "tel:+998937607727" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo withTagline />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
            NEXREEL AI — Instagram Reels reyting signallari, LiveDune benchmarklari va video tahlili asosida ishlovchi sun'iy intellekt platformasi.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-400/80">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              {col.items.map((item) => (
                <li key={item.label}>
                  {item.to ? (
                    <Link to={item.to} className="text-muted-foreground transition-colors hover:text-cyan-400">
                      {item.label}
                    </Link>
                  ) : item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="text-cyan-400/90 font-mono transition-colors hover:text-cyan-300 hover:underline"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/70">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-4 py-5 text-center text-[11px] text-muted-foreground font-mono">
        © {new Date().getFullYear()} NEXREEL AI. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
