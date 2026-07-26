import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Languages } from "lucide-react";
import { useI18n, useTranslations } from "@/client/i18n/context";
import { useTheme } from "@/client/lib/theme";
import { ThemeToggle } from "@/client/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";

export function AppLayout() {
  const t = useTranslations("Navigation");
  const tf = useTranslations("Footer");
  const tt = useTranslations("Theme");
  const { locale, setLocale } = useI18n();
  const { cycleTheme } = useTheme();
  const location = useLocation();
  const onHome = location.pathname === "/";

  // Global keyboard: Shift+T cycles theme (when not typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key.toLowerCase() === "t" && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        cycleTheme();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycleTheme]);

  return (
    <div className="app-canvas relative flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        {t("skipToContent")}
      </a>

      <header className="glass-header sticky top-0 z-50 w-full">
        <div className="container flex h-14 items-center gap-3">
          <Link
            to="/"
            className="group flex items-center gap-2.5 rounded-lg outline-none ring-offset-background transition-opacity focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[hsl(230_90%_58%)] via-primary to-[hsl(var(--glow-2))] shadow-glow ring-1 ring-white/10">
              <img
                src="/icon1.svg"
                alt=""
                className="h-4 w-4 brightness-0 invert"
                width={16}
                height={16}
              />
            </span>
            <span className="font-display text-sm font-bold tracking-tight text-gradient-brand">
              Cloudmark
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-0.5 sm:gap-1" aria-label="Primary">
            {onHome ? (
              <>
                <a href="/#features" className={cn(navClass, "hidden md:flex")}>
                  {t("features")}
                </a>
                <a href="/#security" className={cn(navClass, "hidden md:flex")}>
                  {t("security")}
                </a>
              </>
            ) : null}
            <Link
              to="/doc"
              className={cn(navClass, "hidden sm:flex")}
              aria-current={location.pathname === "/doc" ? "page" : undefined}
            >
              {t("quickstart")}
            </Link>
            <Link
              to="/demo"
              className={navClass}
              aria-current={location.pathname === "/demo" ? "page" : undefined}
            >
              {t("demo")}
            </Link>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label={t("switchLanguage")}
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="font-medium tabular-nums">
                {locale === "zh" ? "EN" : "中文"}
              </span>
            </Button>

            <Button
              asChild
              size="sm"
              className="ml-1 h-8 rounded-full px-4 text-xs font-semibold shadow-glow"
            >
              <Link to="/doc">{t("getStarted")}</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main" className="flex flex-1 flex-col" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-border/50">
        <div className="container flex flex-col items-center gap-2 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-2xs text-muted-foreground">
            {tf("license")} ·{" "}
            <a
              href="https://github.com/wesleyel/cloudmark"
              className="underline-offset-4 transition-colors hover:text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tf("openSource")}
            </a>
          </p>
          <p className="text-2xs text-muted-foreground">
            <span className="mr-1.5 hidden sm:inline" title={tt("cycleHint")}>
              <kbd>⇧T</kbd>
            </span>
            {tf("themeHint")} · © {new Date().getFullYear()}{" "}
            <a
              href="https://github.com/wesleyel"
              className="font-medium text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cloudmark
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

const navClass =
  "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-foreground";
