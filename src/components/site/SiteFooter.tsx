import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();

  const columns = [
    {
      title: t("footer_col_product", "Mahsulot"),
      items: [
        { label: t("nav_analyze", "Video Tahlil"), to: "/analyze" },
        { label: t("nav_accounts", "Instagram Akkaunt"), to: "/accounts" },
        { label: t("nav_pricing", "Tariflar"), to: "/pricing" },
        { label: t("nav_history", "Tahlillar Tarixi"), to: "/history" },
      ],
    },
    {
      title: t("footer_col_algo", "Algoritmlar"),
      items: [
        { label: "Meta Reels 5 Drayveri" },
        { label: "LiveDune Bozor Benchmarki" },
        { label: "Gemini 2.0 Flash Dvigateli" },
      ],
    },
    {
      title: t("footer_col_legal", "Huquqiy & Aloqa"),
      items: [
        { label: t("footer_privacy", "Maxfiylik siyosati") },
        { label: t("footer_terms", "Foydalanish shartlari") },
        { label: t("footer_contact_tg", "Aloqa: @pray_boy"), href: "https://t.me/pray_boy" },
        { label: "Tel: +998 93 760 77 27", href: "tel:+998937607727" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/80 bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo withTagline />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
            {t("footer_desc", "NEXREEL AI — Instagram Reels reyting signallari, LiveDune benchmarklari va video tahlili asosida ishlovchi sun'iy intellekt platformasi.")}
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
        © {new Date().getFullYear()} NEXREEL AI. {t("footer_rights", "Barcha huquqlar himoyalangan.")}
      </div>
    </footer>
  );
}
