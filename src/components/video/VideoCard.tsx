"use client";

import { useState } from "react";
import Image from "next/image";
import type { Video } from "@/types";

interface Props {
  video: Video;
  locale: string;
}

export default function VideoCard({ video, locale }: Props) {
  const title = locale === "zh" && video.title_cn ? video.title_cn : video.title_ja;
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={video.youtube_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block shrink-0 w-[260px] sm:w-[320px] group"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden border border-border-soft bg-gray-100">
        {video.thumbnail_url && !imgError ? (
          <Image
            src={video.thumbnail_url}
            alt={title}
            fill
            sizes="320px"
            className="object-cover group-hover:scale-105 transition-transform"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
            ▶
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-600 line-clamp-2 group-hover:text-love transition-colors text-center">
        {title}
      </p>
    </a>
  );
}
