import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  BookmarkPlus,
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRandomMark, getBaseUrl, cn } from "@/shared/utils";
import { generateWriteToken } from "@/shared/security";
import { buildBookmarkletCode } from "@/shared/bookmarklet";
import {
  DEFAULT_COLLECTION_SETTINGS,
  type CollectionSettings,
} from "@/shared/types";
import {
  downloadTokenBackup,
  isTokenBackupAcknowledged,
  setStoredWriteToken,
  setTokenBackupAcknowledged,
} from "@/client/lib/token-store";
import { claimCollectionApi } from "@/client/lib/api";
import { useTranslations } from "@/client/i18n/context";
import { BookmarkletLink } from "@/client/components/bookmarklet-link";
import { CollectionSettingsFields } from "@/client/components/collection-settings-fields";

type StepId = "name" | "token" | "settings" | "install";

const MARK_PATTERN = /^[a-zA-Z0-9_-]{4,64}$/;

export function DocPage() {
  const t = useTranslations("DocPage");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mark, setMark] = useState("");
  const [writeToken, setWriteToken] = useState("");
  const [settings, setSettings] = useState<CollectionSettings>({
    ...DEFAULT_COLLECTION_SETTINGS,
  });
  const [done, setDone] = useState<Partial<Record<StepId, boolean>>>({});
  const [copied, setCopied] = useState<"token" | "code" | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const baseUrl = getBaseUrl();

  const bookmarkletCode = useMemo(() => {
    if (!mark || !writeToken) return "";
    return buildBookmarkletCode(baseUrl, mark, writeToken);
  }, [baseUrl, mark, writeToken]);

  useEffect(() => {
    // Prefill from home page's "create your collection" input when present
    const requested = searchParams.get("mark") ?? "";
    const m = MARK_PATTERN.test(requested) ? requested : generateRandomMark();
    const tok = generateWriteToken();
    setMark(m);
    setWriteToken(tok);
    setStoredWriteToken(m, tok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mark && writeToken) setStoredWriteToken(mark, writeToken);
  }, [mark, writeToken]);

  const copy = async (kind: "token" | "code") => {
    const text = kind === "token" ? writeToken : bookmarkletCode;
    await navigator.clipboard.writeText(text);
    if (kind === "token" && mark) {
      setTokenBackupAcknowledged(mark, true);
    }
    setCopied(kind);
    setTimeout(() => setCopied(null), 1600);
  };

  const regenerateAll = () => {
    const nextMark = generateRandomMark();
    const nextToken = generateWriteToken();
    setMark(nextMark);
    setWriteToken(nextToken);
    setStoredWriteToken(nextMark, nextToken);
    setClaimed(false);
    setDone({});
  };

  const syncToServer = useCallback(
    async (nextSettings = settings) => {
      if (!mark || !writeToken) return false;
      setSyncing(true);
      try {
        const result = await claimCollectionApi({
          mark,
          token: writeToken,
          settings: nextSettings,
        });
        setSettings(result.settings);
        setClaimed(true);
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("setup.syncFailed"));
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [mark, writeToken, settings, t],
  );

  const completeStep = async (step: StepId) => {
    if (step === "name") {
      if (mark.trim().length < 4) {
        toast.error(t("setup.name.tooShort"));
        return;
      }
      // Bind token to the chosen mark before claim
      setStoredWriteToken(mark, writeToken);
      setDone((d) => ({ ...d, name: true }));
      return;
    }
    if (step === "token") {
      if (!isTokenBackupAcknowledged(mark)) {
        toast.error(t("setup.token.mustBackup"));
        return;
      }
      // Claim immediately with defaults so later private settings / open cannot race.
      const ok = await syncToServer({ ...DEFAULT_COLLECTION_SETTINGS });
      if (!ok) return;
      toast.success(t("setup.token.claimed"));
      setDone((d) => ({ ...d, name: true, token: true }));
      return;
    }
    if (step === "settings") {
      // Update claimed collection (including isPublic) with the same token.
      const ok = await syncToServer(settings);
      if (!ok) return;
      setDone((d) => ({ ...d, settings: true }));
      return;
    }
    if (step === "install") {
      setDone((d) => ({ ...d, install: true }));
    }
  };

  if (!mark) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container relative max-w-3xl py-14 sm:py-16">
      <div
        className="pointer-events-none absolute inset-x-0 -top-8 -z-10 h-48 opacity-70"
        aria-hidden
      >
        <div className="orb orb-a left-1/2 h-40 w-40 -translate-x-1/2" />
      </div>

      {/* Title block */}
      <header className="reveal">
        <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          {t("kicker")}
        </p>
        <h1 className="display-font text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </header>

      <div className="mt-11 h-px bg-border/70" aria-hidden />

      {/* Step 1 — name */}
      <StepSection
        index="01"
        done={Boolean(done.name)}
        title={t("setup.steps.name")}
        desc={t("setup.name.desc")}
      >
        <div className="flex max-w-[420px] gap-3">
          <Input
            value={mark}
            onChange={(e) => {
              setMark(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""));
              setClaimed(false);
              setDone({});
            }}
            className="h-10 flex-1 rounded-full px-4 font-mono text-sm tabular-nums"
            spellCheck={false}
            autoComplete="off"
            aria-label={t("setup.steps.name")}
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 rounded-full"
            onClick={regenerateAll}
          >
            <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
            {t("setup.name.random")}
          </Button>
        </div>
        <p className="mt-2.5 text-xs tabular-nums text-muted-foreground">
          {baseUrl}/{mark || "…"}
        </p>
        <StepContinue
          syncing={false}
          label={t("setup.next")}
          onClick={() => void completeStep("name")}
        />
      </StepSection>

      {/* Step 2 — token */}
      <StepSection
        index="02"
        done={Boolean(done.token)}
        title={t("setup.steps.token")}
        desc={t("setup.token.desc")}
      >
        <div className="flex max-w-[480px] items-stretch gap-3">
          <code className="flex min-w-0 flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-border/70 bg-muted/40 px-4 py-2 font-mono text-xs text-foreground/90">
            {writeToken}
          </code>
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 rounded-full"
            onClick={() => void copy("token")}
          >
            {copied === "token" ? (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            {t("setup.token.copy")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 rounded-full"
            onClick={() => {
              setStoredWriteToken(mark, writeToken);
              downloadTokenBackup(mark, writeToken);
              setTokenBackupAcknowledged(mark, true);
              toast.success(t("setup.token.download"));
            }}
            title={t("setup.token.download")}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only">{t("setup.token.download")}</span>
          </Button>
        </div>
        <p className="mt-2.5 text-xs font-medium text-primary">
          {t("setup.token.warn")}
        </p>
        <StepContinue
          syncing={syncing}
          syncingLabel={t("setup.claiming")}
          label={t("setup.next")}
          onClick={() => void completeStep("token")}
        />
      </StepSection>

      {/* Step 3 — preferences */}
      <StepSection
        index="03"
        done={Boolean(done.settings)}
        title={t("setup.steps.settings")}
        desc={t("setup.settings.desc")}
      >
        <CollectionSettingsFields
          value={settings}
          onChange={(next) => {
            setSettings(next);
            setClaimed(false);
          }}
          disabled={syncing}
        />
        <StepContinue
          syncing={syncing}
          syncingLabel={t("setup.saving")}
          label={t("setup.next")}
          onClick={() => void completeStep("settings")}
        />
      </StepSection>

      {/* Step 4 — install the two buttons */}
      <StepSection
        index="04"
        done={Boolean(done.install)}
        title={t("setup.steps.install")}
        desc={t("setup.install.desc")}
        last
      >
        {/* Faux bookmarks bar with the two real draggable chips */}
        <div className="max-w-[480px] overflow-hidden rounded-xl border border-border/70 bg-card/40">
          <div className="border-b border-border/70 bg-muted/50 px-3.5 py-2 text-2xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {t("setup.install.bar")}
          </div>
          <div className="flex flex-wrap gap-2.5 px-3.5 py-4">
            <BookmarkletLink code={bookmarkletCode} className="inline-flex">
              <Button
                size="sm"
                className="h-9 cursor-grab rounded-full px-4 shadow-glow active:cursor-grabbing"
                asChild
              >
                <span className="flex items-center gap-1.5 truncate">
                  <BookmarkPlus className="h-3.5 w-3.5 shrink-0" />
                  <span className="max-w-[11rem] truncate">
                    {t("setup.install.saveButton", { mark })}
                  </span>
                </span>
              </Button>
            </BookmarkletLink>
            <a
              href={`/${mark}`}
              draggable
              className="inline-flex"
              onClick={(e) => {
                // Prefer drag-install; click opens after ensuring claim.
                e.preventDefault();
                void (async () => {
                  if (!claimed) {
                    const ok = await syncToServer();
                    if (!ok) return;
                  }
                  navigate(`/${mark}`);
                })();
              }}
            >
              <Button
                size="sm"
                variant="outline"
                className="h-9 cursor-grab rounded-full px-4 active:cursor-grabbing"
                asChild
              >
                <span className="flex items-center gap-1.5 truncate">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {t("setup.install.openCollection")}
                  </span>
                </span>
              </Button>
            </a>
          </div>
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">
          {t("setup.install.barHint")}
        </p>
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            onClick={() => void copy("code")}
          >
            {copied === "code" ? (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            {t("setup.install.copyCode")}
          </Button>
        </div>
      </StepSection>

      <div className="h-px bg-border/70" aria-hidden />

      {/* Close — look first? */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-7">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
            {t("demo.title")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("demo.description")}
          </p>
        </div>
        <Button asChild className="h-10 shrink-0 rounded-full px-6 shadow-glow">
          <Link to="/demo">{t("demo.button")}</Link>
        </Button>
      </div>
    </div>
  );
}

function StepSection({
  index,
  done,
  title,
  desc,
  last,
  children,
}: {
  index: string;
  done: boolean;
  title: string;
  desc: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "grid grid-cols-[3rem_minmax(0,1fr)] gap-5 py-9 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-6",
        !last && "border-b border-border/70",
      )}
    >
      <span
        className={cn(
          "display-font relative text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-[2.75rem]",
          done ? "text-primary/70" : "text-foreground/25",
        )}
        aria-hidden
      >
        {index}
        {done ? (
          <Check
            className="absolute -right-1 top-0 h-4 w-4 text-primary"
            strokeWidth={3}
          />
        ) : null}
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <p className="mb-4 mt-2 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
          {desc}
        </p>
        {children}
      </div>
    </section>
  );
}

function StepContinue({
  syncing,
  syncingLabel,
  label,
  onClick,
}: {
  syncing: boolean;
  syncingLabel?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-4">
      <Button
        type="button"
        size="sm"
        className="rounded-full px-5"
        disabled={syncing}
        onClick={onClick}
      >
        {syncing ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            {syncingLabel ?? label}
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  );
}
