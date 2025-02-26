"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMessages, useTranslations } from "next-intl";
import Image from "next/image";
import "./page.css"; // 引入CSS文件

export default function Page() {
  const t = useTranslations("HomePage");
  const messages = useMessages();
  // @ts-expect-error
  const keys = Object.keys(messages.HomePage.features);

  return (
    <div className="container relative">
      {/* 装饰背景元素 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-3xl transform -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-purple-500/10 rounded-full blur-3xl transform translate-y-12 -translate-x-12" />
        <div className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero 区域 */}
      <div className="flex flex-col items-center text-center pt-16 lg:pt-24 pb-8 max-w-3xl mx-auto animate-fadeIn">
        {/* Logo 和主标题 */}
        <div className="relative mb-3 animate-scaleIn">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
            Cloudmark
          </h1>
          <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-xl -z-10" />
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fadeIn animation-delay-400">
          {t("title")}
        </h2>

        <p className="text-xl text-muted-foreground mb-8 max-w-xl animate-fadeIn animation-delay-600">
          {t("description")}
        </p>

        {/* GitHub Star Badge */}
        <div className="mb-8 animate-fadeIn animation-delay-700">
          <a
            href="https://github.com/wesleyel/cloudmark"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://img.shields.io/github/stars/wesleyel/cloudmark?style=social"
              alt="GitHub stars"
              className="transition-transform hover:scale-105"
            />
          </a>
        </div>

        <div className="flex gap-4">
          <div className="animate-fadeUp animation-delay-800 hover-scale active-scale">
            <Button asChild size="lg" className="rounded-full text-base px-8">
              <Link href="/doc" className="flex items-center gap-2">
                {t("quickstart")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="animate-fadeUp animation-delay-900 hover-scale active-scale">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full text-base px-8"
            >
              <Link href="/demo" className="flex items-center gap-2">
                Demo
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 特性卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12 stagger-container">
        {keys.map((key, index) => (
          <div
            key={key}
            className={`relative rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 transition-all stagger-item feature-card animation-delay-${index * 100}`}
          >
            <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-lg -z-10 transform -translate-y-1/4 translate-x-1/4" />
            <h3 className="font-semibold mb-3 text-xl">
              {t(`features.${key}.title`)}
            </h3>
            <p className="text-muted-foreground">{t(`features.${key}.desc`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
