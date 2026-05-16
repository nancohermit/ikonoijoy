"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Group } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  groups: Group[];
}

export default function GroupCarousel({ groups }: Props) {
  const [current, setCurrent] = useState(0);
  const pathname = usePathname();
  const locale = pathname.startsWith("/zh") ? "zh" : "ja";

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % groups.length);
  }, [groups.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + groups.length) % groups.length);
  }, [groups.length]);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  if (groups.length === 0) return null;

  const group = groups[current];
  const colorMap: Record<string, { from: string; to: string; text: string }> = {
    "#dc7280": { from: "#ffe0e5", to: "#ffd0d8", text: "#b06070" },
    "#8bcabe": { from: "#d5f0ed", to: "#c0e8e4", text: "#509090" },
    "#fae06d": { from: "#fff6d5", to: "#ffeeaa", text: "#b09020" },
  };
  const colors = colorMap[group.color] || { from: "#ffe0e5", to: "#ffd0d8", text: "#b06070" };

  return (
    <section
      className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
      }}
      aria-label="グループカルーセル"
    >
      <button
        onClick={prev}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/60 hover:bg-white/90 flex items-center justify-center transition-colors"
        aria-label="前のグループ"
      >
        <ChevronLeft className="w-5 h-5" style={{ color: colors.text }} />
      </button>

      <Link
        href={`/${locale}/about?group=${group.slug}`}
        className="text-center px-8 py-12"
      >
        {group.logo_url && (
          <Image
            src={group.logo_url}
            alt={group.name_ja}
            width={200}
            height={100}
            className="mx-auto mb-6"
          />
        )}
        <div className="text-6xl mb-4">♡</div>
        <h2
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ color: colors.text }}
        >
          {group.name_ja}
        </h2>
        <p className="text-sm opacity-70 max-w-md mx-auto" style={{ color: colors.text }}>
          {locale === "ja" ? group.description_ja : group.description_cn}
        </p>
      </Link>

      <button
        onClick={next}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/60 hover:bg-white/90 flex items-center justify-center transition-colors"
        aria-label="次のグループ"
      >
        <ChevronRight className="w-5 h-5" style={{ color: colors.text }} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {groups.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? "bg-white scale-110" : "bg-white/40"
            }`}
            aria-label={`グループ${i + 1}に切り替え`}
          />
        ))}
      </div>
    </section>
  );
}
