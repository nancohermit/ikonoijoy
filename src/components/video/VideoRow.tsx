"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Video } from "@/types";
import VideoCard from "./VideoCard";

interface Props {
  videos: Video[];
  locale: string;
}

export default function VideoRow({ videos, locale }: Props) {
  const t = useTranslations("home");

  if (videos.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-love">{t("recommendedVideos")}</h2>
        <Link
          href={`/${locale}/videos`}
          className="text-sm text-love hover:underline"
        >
          {t("viewAllVideos")} →
        </Link>
      </div>
      <ScrollArea>
        <div className="flex gap-4 pb-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} locale={locale} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
