import { memo, type MouseEvent } from "react";
import { Check, ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { BookmarkInstance } from "@/shared/types";
import { cn, getDomain } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/client/i18n/context";
import { BookmarkIcon } from "@/client/components/bookmark-icon";

/** Localized relative date — 今天 / 昨天 / N 天前 / N 周前 / N 个月前 / N 年前 */
function relativeDateLabel(
  iso: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 86_400_000,
  );
  if (days <= 0) return t("today");
  if (days === 1) return t("yesterday");
  if (days < 7) return t("daysAgo", { n: days });
  if (days < 30) return t("weeksAgo", { n: Math.floor(days / 7) });
  if (days < 365) return t("monthsAgo", { n: Math.floor(days / 30) });
  return t("yearsAgo", { n: Math.floor(days / 365) });
}

interface BookmarkRowProps {
  bookmark: BookmarkInstance;
  /** Multi-select membership */
  selected: boolean;
  /** Keyboard focus cursor */
  focused: boolean;
  canWrite: boolean;
  onSelect: (event: MouseEvent) => void;
  onToggle: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Shared grid template — must match collection list header */
export const BOOKMARK_ROW_GRID =
  "grid-cols-[1rem_1.25rem_minmax(0,1fr)_auto] sm:grid-cols-[1rem_1.25rem_minmax(0,1fr)_7rem_5.5rem_5.25rem]";

export const BookmarkRow = memo(function BookmarkRow({
  bookmark,
  selected,
  focused,
  canWrite,
  onSelect,
  onToggle,
  onOpen,
  onEdit,
  onDelete,
}: BookmarkRowProps) {
  const t = useTranslations("Components.BookmarkCard");
  const domain = getDomain(bookmark.url);
  const date = relativeDateLabel(bookmark.createdAt, t);

  return (
    <div
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      data-selected={selected || undefined}
      data-focused={focused || undefined}
      data-uuid={bookmark.uuid}
      className={cn(
        "bookmark-row group relative grid cursor-pointer items-center gap-x-2 border-b border-border/50 px-2 py-2.5 text-sm sm:gap-x-3 sm:px-3",
        BOOKMARK_ROW_GRID,
        "hover:bg-muted/45",
        // Selected = membership in selection set (checkbox / multi)
        selected && "is-selected",
        // Focused = keyboard/mouse cursor — distinct from selection
        focused && "is-focused",
      )}
      onClick={onSelect}
      onDoubleClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
    >
      {/* Checkbox — only control that toggles multi-select without modifiers */}
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={selected ? t("deselect") : t("select")}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center justify-self-center rounded-[4px] border transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-muted-foreground/35 bg-background hover:border-primary/55",
          focused && !selected && "border-primary/50",
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggle();
        }}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </button>

      {/* Favicon / custom icon */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center justify-self-center overflow-hidden rounded-md transition-colors",
          selected
            ? "bg-primary/12 ring-1 ring-primary/25"
            : focused
              ? "bg-muted ring-1 ring-border"
              : "bg-muted/80",
        )}
        aria-hidden
      >
        <BookmarkIcon
          favicon={bookmark.favicon}
          title={bookmark.title}
          className="text-sm"
          imgClassName="h-4 w-4"
        />
      </div>

      {/* Title / URL / description stack */}
      <div className="flex min-w-0 flex-col gap-0.5 py-0.5">
        <span
          className={cn(
            "truncate leading-snug",
            selected || focused ? "font-semibold text-foreground" : "font-medium text-foreground",
          )}
          title={bookmark.title}
        >
          {bookmark.title}
        </span>
        <span
          className="truncate text-2xs leading-snug text-muted-foreground"
          title={bookmark.url}
        >
          {domain}
        </span>
        {bookmark.description ? (
          <p
            className="truncate text-2xs leading-snug text-muted-foreground/80"
            title={bookmark.description}
          >
            {bookmark.description}
          </p>
        ) : null}
      </div>

      {/* Category */}
      <Badge
        variant="outline"
        className={cn(
          "hidden max-w-full justify-self-start truncate px-1.5 py-0 text-2xs font-normal sm:inline-flex",
          selected && "border-primary/25 bg-primary/5 text-foreground",
        )}
      >
        {bookmark.category}
      </Badge>

      {/* Date */}
      <span
        className={cn(
          "hidden justify-self-end whitespace-nowrap text-2xs tabular-nums md:inline",
          selected ? "text-foreground/70" : "text-muted-foreground",
        )}
      >
        {date}
      </span>

      {/* Actions */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-end gap-0.5 justify-self-end transition-opacity",
          selected || focused
            ? "opacity-100"
            : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title={t("visit")}
          onClick={onOpen}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title={t("edit")}
          disabled={!canWrite}
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          title={t("delete")}
          disabled={!canWrite}
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
});
