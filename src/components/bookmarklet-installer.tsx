"use client";

import { useEffect, useState, useCallback } from "react";
import { Bookmark, Copy, Check, Wand2, RefreshCcw } from "lucide-react";
import { MarkInput } from "@/components/mark-input";
import { BookmarkButtons } from "@/components/bookmark-buttons";
import styles from "./bookmarklet-installer.module.css";
import { Button } from "@/components/ui/button";
import { defaultMark } from "@/lib/types";
import { useTranslations } from "next-intl";

interface BookmarkletInstallerProps {
  mark?: string;
  onMarkChange?: (mark: string) => void;
}

export default function BookmarkletInstaller({
  mark: externalMark,
  onMarkChange: externalOnMarkChange,
}: BookmarkletInstallerProps) {
  const t = useTranslations("Components.BookmarkletInstaller");
  const [localMark, setLocalMark] = useState(defaultMark);
  const [bookmarkletCode, setBookmarkletCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 使用外部或本地状态
  const mark = externalMark ?? localMark;
  const onMarkChange = useCallback(
    (newMark: string) => {
      if (externalOnMarkChange) {
        externalOnMarkChange(newMark);
      } else {
        setLocalMark(newMark);
      }
    },
    [externalOnMarkChange],
  );

  // 获取当前网站的基础 URL
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  // 生成bookmarklet代码
  const generateBookmarkletCode = useCallback(
    (markValue: string) => {
      const code = `javascript:(function(){let m='${markValue}',u=encodeURIComponent(location.href),t=encodeURIComponent(document.title);window.open('${baseUrl}/api/add?mark='+m+'&title='+t+'&url='+u, '_blank').focus()})()`;
      setBookmarkletCode(code);
    },
    [baseUrl],
  );

  // 生成随机字符串
  const generateRandomMark = () => {
    setIsGenerating(true);
    const adjectives = [
      "vacuous",
      "tearful",
      "faint",
      "jumbled",
      "wandering",
      "mature",
      "savory",
      "mighty",
      "disgusted",
      "abstracted",
      "telling",
      "descriptive",
      "purple",
      "hateful",
      "abundant",
      "fascinated",
      "plastic",
      "black-and-white",
      "practical",
      "craven",
      "few",
      "aback",
      "loutish",
      "dirty",
      "extra-large",
      "traditional",
      "tired",
      "former",
      "roasted",
      "efficient",
      "feigned",
      "gifted",
      "silly",
      "ad hoc",
      "puzzled",
      "aquatic",
      "watery",
      "tight",
      "weak",
      "spotless",
      "abiding",
      "pumped",
      "icy",
      "cool",
      "dysfunctional",
      "ordinary",
      "obeisant",
      "white",
      "plant",
      "subdued",
    ];
    const nouns = [
      "person",
      "inspector",
      "significance",
      "chapter",
      "reputation",
      "outcome",
      "association",
      "failure",
      "population",
      "wealth",
      "bird",
      "news",
      "thing",
      "possibility",
      "variation",
      "blood",
      "throat",
      "bonus",
      "transportation",
      "hearing",
      "appointment",
      "republic",
      "situation",
      "freedom",
      "government",
      "studio",
      "candidate",
      "thanks",
      "thought",
      "feedback",
      "resource",
      "activity",
      "error",
      "historian",
      "way",
      "childhood",
      "employer",
      "cousin",
      "tongue",
      "painting",
      "session",
      "atmosphere",
      "medicine",
      "insect",
      "church",
      "goal",
      "device",
      "psychology",
      "importance",
      "instance",
    ];
    const randomNum = Math.floor(Math.random() * 10000);
    const newMark = `${
      adjectives[Math.floor(Math.random() * adjectives.length)]
    }-${nouns[Math.floor(Math.random() * nouns.length)]}-${randomNum}`;
    onMarkChange(newMark);
    setTimeout(() => setIsGenerating(false), 500);
  };

  useEffect(() => {
    generateBookmarkletCode(mark);
  }, [mark, generateBookmarkletCode]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fade-in-up space-y-8">
      {/* Mark输入区域 */}
      <MarkInput
        mark={mark}
        onChange={onMarkChange}
        onGenerateRandom={generateRandomMark}
        isGenerating={isGenerating}
      />

      {/* 书签按钮区域 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-3">
          {t("bookmarkTools")}
        </h3>
        <BookmarkButtons
          mark={mark}
          bookmarkletCode={bookmarkletCode}
          baseUrl={baseUrl}
        />
      </div>

      {/* 代码显示区域 */}
      <details className={styles.details}>
        <summary className={styles.summary}>
          <Wand2 className="h-5 w-5" />
          {t("viewCode")}
        </summary>
        <div className={styles.content}>
          <div className="relative mt-3">
            <div className="max-h-[200px] overflow-y-auto">
              <pre className="p-4 bg-muted/50 backdrop-blur-sm rounded-lg text-sm whitespace-pre-wrap break-all border border-border/60">
                <code>{bookmarkletCode}</code>
              </pre>
            </div>
            <div className="absolute right-2 top-2 hover-scale">
              <Button
                size="sm"
                variant="ghost"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
