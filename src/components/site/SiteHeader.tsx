import { Link } from "@tanstack/react-router";
import { Sparkles, Upload } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";

const links = [
  { to: "/analyze", label: "Tahlil qilish", icon: Upload },
  { to: "/pricing", label: "Tariflar" },
  { to: "/accounts", label: "Instagram Akkaunt" },
] as const;

export function SiteHeader() {
  const { user, hydrated } = useAppStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-xs font-semibold text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {hydrated && user ? (
            <Button asChild size="sm" className="font-semibold">
              <Link to="/analyze">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Tahlil Paneli
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex">
                <Link to="/login">Kirish</Link>
              </Button>
              <Button asChild size="sm" className="text-xs font-semibold">
                <Link to="/signup">Bepul Boshlash</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
