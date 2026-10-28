import React from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, LANGUAGES, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "ghost" | "outline" | "compact";
}

export function LanguageSwitcher({ className, variant = "outline" }: LanguageSwitcherProps) {
  const { language, setLanguage, currentOption } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Tilni tanlash / Выбор языка / Select Language"
          className={cn(
            "group relative inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/40 px-2 py-1 text-[11px] font-mono font-bold text-foreground/90 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 active:scale-95",
            className
          )}
        >
          <Globe className="h-3.5 w-3.5 text-cyan-400/90 transition-transform duration-300 group-hover:rotate-45" />
          <span className="text-xs">{currentOption.flag}</span>
          <span className="tracking-wider">{currentOption.shortLabel}</span>
          <ChevronDown className="h-2.5 w-2.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="min-w-[140px] rounded-xl border border-cyan-500/30 bg-[#0B101B]/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
      >
        <div className="px-2 py-1 text-[9px] font-mono font-extrabold uppercase tracking-widest text-muted-foreground/80">
          Til / Язык / Lang
        </div>
        {LANGUAGES.map((item) => {
          const isSelected = item.code === language;
          return (
            <DropdownMenuItem
              key={item.code}
              onClick={() => setLanguage(item.code)}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors outline-none",
                isSelected
                  ? "bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.flag}</span>
                <span className="font-sans text-xs">{item.label}</span>
              </div>
              {isSelected ? (
                <Check className="h-3.5 w-3.5 text-cyan-400" />
              ) : (
                <span className="font-mono text-[10px] text-muted-foreground/60">{item.shortLabel}</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
