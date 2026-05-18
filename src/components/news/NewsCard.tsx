"use client";

import type { NewsItem } from "@/types";
import { ExternalLink } from "lucide-react";
import { getCategoryColor } from "@/lib/design/categories";

interface Props {
  item: NewsItem;
  index: number;
  locale: string;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

export default function NewsCard({ item, index, locale }: Props) {
  const catColor = getCategoryColor(item.category);
  const displayDate = formatDate(item.date);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: "both",
      }}
    >
      <article
        className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500
                      flex gap-4 rounded-xl border border-brand-border-soft bg-white
                      p-4 transition-all duration-200
                      hover:shadow-md hover:border-brand-love/20 hover:-translate-y-0.5"
      >
        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">
              NEWS
            </div>
          )}
          {item.category && (
            <span
              className="absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: catColor.bg,
                color: catColor.text,
              }}
            >
              {item.category}
            </span>
          )}
        </div>

        <div className="flex flex-col justify-between min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <time className="text-xs text-gray-400 shrink-0">{displayDate}</time>
          </div>
          <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 group-hover:text-love transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-love transition-colors">
            <ExternalLink className="w-3 h-3" />
            <span>詳細</span>
          </div>
        </div>
      </article>
    </a>
  );
}
