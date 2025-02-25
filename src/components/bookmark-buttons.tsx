import { Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface BookmarkButtonsProps {
  mark: string;
  bookmarkletCode: string;
  baseUrl: string;
}

export function BookmarkButtons({
  mark,
  bookmarkletCode,
  baseUrl,
}: BookmarkButtonsProps) {
  const t = useTranslations("Components.BookmarkButtons");

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="hover-scale">
        <a
          href="#"
          draggable={true}
          ref={(node) => {
            if (node) {
              node.setAttribute("href", bookmarkletCode);
            }
          }}
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 h-10 px-5 py-2 select-all cursor-move shadow-md hover:shadow-lg"
        >
          <Bookmark className="mr-2 h-4 w-4" />
          {t("saveButton", { mark })}
        </a>
      </div>

      <div className="hover-scale">
        <a
          href={`${baseUrl}/${mark}`}
          draggable={true}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-5 py-2 select-all cursor-move shadow-sm hover:shadow-md"
          suppressHydrationWarning
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {t("openButton", { mark })}
        </a>
      </div>

      <div className="hidden sm:flex items-center ml-2 text-sm text-muted-foreground">
        <span className="animate-pulse">←</span>
        <span className="ml-2">{t("dragTip")}</span>
      </div>
    </div>
  );
}
