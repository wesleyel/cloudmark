import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/client/i18n/context";
import { cn } from "@/shared/utils";

/** Stat values are locale-independent; labels come from messages */
const STATS: Array<{ value: string; labelKey: string; gilt?: boolean }> = [
  { value: "1", labelKey: "stats.click", gilt: true },
  { value: "0", labelKey: "stats.accounts" },
  { value: "14", labelKey: "stats.shortcuts" },
  { value: "2", labelKey: "stats.languages" },
];

const FEATURE_KEYS = ["save", "categorize", "access"] as const;

const KEY_ITEMS: Array<{ keys: string[]; labelKey: string; joiner?: string }> = [
  { keys: ["/"], labelKey: "keys.search" },
  { keys: ["j", "k"], labelKey: "keys.nav" },
  { keys: ["n"], labelKey: "keys.new" },
  { keys: ["e"], labelKey: "keys.edit" },
  { keys: ["d"], labelKey: "keys.del" },
  { keys: ["1", "9"], labelKey: "keys.cat", joiner: "–" },
  { keys: ["?"], labelKey: "keys.help" },
];

export function HomePage() {
  const t = useTranslations("HomePage");
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const startWithName = (e: FormEvent) => {
    e.preventDefault();
    const mark = name.trim();
    navigate(mark ? `/doc?mark=${encodeURIComponent(mark)}` : "/doc");
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="grid-fade absolute inset-0 opacity-40" />
        <div className="orb orb-a -right-24 -top-16 h-[28rem] w-[28rem] sm:h-[36rem] sm:w-[36rem]" />
        <div className="orb orb-b -bottom-24 -left-20 h-[26rem] w-[26rem] sm:h-[34rem] sm:w-[34rem]" />
      </div>

      <div className="container relative max-w-6xl">
        {/* Hero */}
        <section className="pb-16 pt-16 sm:pt-24 lg:pt-28">
          <h1 className="reveal display-font max-w-4xl text-balance text-[clamp(2.5rem,6.6vw,5.25rem)] font-bold leading-[1.08] tracking-tight">
            <span className="block text-gradient">{t("hero.line1")}</span>
            <span className="block text-gradient">{t("hero.line2")}</span>
          </h1>
          <p className="reveal reveal-delay-1 mt-7 max-w-[58ch] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.sub")}
          </p>
          <div className="reveal reveal-delay-2 mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-full px-7 text-sm font-semibold shadow-glow"
            >
              <Link to="/doc" className="flex items-center gap-2">
                {t("hero.cta")}
                <ArrowRight className="h-4 w-4 opacity-80" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-11 rounded-full px-5 text-sm font-semibold text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Link to="/demo">{t("hero.demo")}</Link>
            </Button>
            <span className="text-xs text-muted-foreground">{t("hero.hint")}</span>
          </div>
        </section>

        <hr className="border-border/70" />

        {/* Stat row — exactly one highlighted numeral */}
        <section
          className="reveal grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-14 lg:grid-cols-4 lg:justify-between"
          aria-label={t("statsLabel")}
        >
          {STATS.map((s) => (
            <div key={s.labelKey}>
              <p
                className={cn(
                  "display-font text-[clamp(2.25rem,3.6vw,3.25rem)] font-bold leading-none tracking-tight tabular-nums",
                  s.gilt ? "text-primary" : "text-foreground",
                )}
              >
                {s.value}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.08em] text-foreground/70">
                {t(s.labelKey)}
              </p>
            </div>
          ))}
        </section>

        <hr className="border-border/70" />

        {/* Features — three columns parted by hairlines */}
        <section className="py-14 sm:py-16" id="features">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            {t("features.kicker")}
          </p>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-border/70">
            {FEATURE_KEYS.map((key, i) => (
              <article
                key={key}
                className={cn(
                  "max-w-[62ch]",
                  i > 0 && "lg:pl-10",
                  i < FEATURE_KEYS.length - 1 && "lg:pr-10",
                )}
              >
                <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  {t(`features.${key}.title`)}
                </h2>
                <p className="mt-3 text-justify text-[0.95rem] leading-7 text-foreground/75 [hyphens:auto]">
                  {t(`features.${key}.desc`)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <hr className="border-border/70" />

        {/* Security — prose beside the token table */}
        <section
          className="grid grid-cols-1 items-start gap-8 py-14 sm:py-16 md:grid-cols-2 md:gap-x-16 lg:gap-x-24"
          id="security"
        >
          <div>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              {t("security.kicker")}
            </p>
            <h2 className="display-font max-w-md text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
              <span className="text-gradient">{t("security.title")}</span>
            </h2>
            <p className="mt-5 max-w-[48ch] text-justify text-[0.95rem] leading-7 text-foreground/75 [hyphens:auto]">
              {t("security.note")}
            </p>
          </div>
          <table className="w-full border-collapse text-sm md:mt-9">
            <thead>
              <tr>
                <th className="border-b border-border/70 pb-2.5 pr-3 text-left text-2xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {t("security.thAction")}
                </th>
                <th className="border-b border-border/70 pb-2.5 text-right text-2xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {t("security.thRequires")}
                </th>
              </tr>
            </thead>
            <tbody>
              {(["View", "Write", "Save"] as const).map((row) => (
                <tr key={row} className="transition-colors hover:bg-muted/40">
                  <td className="border-b border-border/60 py-2.5 pr-3">
                    {t(`security.row${row}A`)}
                  </td>
                  <td className="border-b border-border/60 py-2.5 text-right text-muted-foreground">
                    {t(`security.row${row}B`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Keyboard row */}
        <section className="pb-14 sm:pb-16">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            {t("keys.kicker")}
          </p>
          <div className="flex flex-wrap gap-x-10 gap-y-3.5">
            {KEY_ITEMS.map((item) => (
              <span
                key={item.labelKey}
                className="inline-flex items-baseline gap-2 text-sm text-foreground/75"
              >
                <span className="inline-flex items-center gap-1">
                  {item.keys.map((k, i) => (
                    <span key={k} className="inline-flex items-center gap-1">
                      {i > 0 && (
                        <span className="text-muted-foreground">
                          {item.joiner ?? ""}
                        </span>
                      )}
                      <kbd>{k}</kbd>
                    </span>
                  ))}
                </span>
                {t(item.labelKey)}
              </span>
            ))}
          </div>
        </section>

        <hr className="border-border/70" />

        {/* Close — name your collection */}
        <section className="py-14 sm:py-16" id="start">
          <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {t("close.title")}
          </h3>
          <p className="mt-3 max-w-[58ch] text-[0.95rem] leading-7 text-foreground/75">
            {t("close.sub")}
          </p>
          <form
            className="mt-6 flex max-w-[480px] items-stretch gap-3"
            onSubmit={startWithName}
          >
            <Input
              value={name}
              onChange={(e) =>
                setName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
              }
              placeholder={t("close.placeholder")}
              aria-label={t("close.title")}
              spellCheck={false}
              autoComplete="off"
              className="h-11 flex-1 rounded-full px-4 font-mono text-sm tabular-nums"
            />
            <Button
              type="submit"
              size="lg"
              className="h-11 shrink-0 rounded-full px-6 text-sm font-semibold shadow-glow"
            >
              {t("close.cta")}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
