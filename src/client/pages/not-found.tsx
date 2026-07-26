import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/client/i18n/context";

export function NotFoundPage() {
  const t = useTranslations("NotFoundPage");

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-12 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="grid-fade absolute inset-0 opacity-40" />
        <div className="orb orb-a right-1/4 top-1/4 h-64 w-64 opacity-60" />
      </div>

      <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
        {t("kicker")}
      </p>

      <p
        className="reveal reveal-delay-1 display-font text-[clamp(7.5rem,18vw,12.5rem)] font-bold leading-[0.95] tracking-tight tabular-nums"
        aria-label={t("errorCode")}
      >
        <span>4</span>
        <span className="text-gradient">0</span>
        <span>4</span>
      </p>

      <div className="reveal reveal-delay-2 my-8 h-px w-[72px] bg-border" aria-hidden />

      <h1 className="reveal reveal-delay-2 mb-2.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        {t("title")}
      </h1>
      <p className="reveal reveal-delay-3 mb-7 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
        {t("description")}
      </p>

      <div className="reveal reveal-delay-4 flex flex-wrap items-center justify-center gap-3.5">
        <Button asChild className="h-11 rounded-full px-6 shadow-glow">
          <Link to="/">{t("home")}</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="h-11 rounded-full px-5 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Link to="/demo">{t("demo")}</Link>
        </Button>
      </div>
    </div>
  );
}
