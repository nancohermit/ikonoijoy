"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Group, CarouselImage } from "@/types";

interface Props {
  groups: Group[];
  carouselImages: CarouselImage[];
}

const colorMap: Record<string, { from: string; to: string; text: string }> = {
  "#dc7280": { from: "#ffe0e5", to: "#dc7280", text: "#ffffff" },
  "#8bcabe": { from: "#d5f0ed", to: "#8bcabe", text: "#ffffff" },
  "#fae06d": { from: "#fff6d5", to: "#fae06d", text: "#7a6010" },
};

export default function GroupCarousel({ groups, carouselImages }: Props) {
  const [current, setCurrent] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const locale = pathname.startsWith("/zh") ? "zh" : "ja";

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % groups.length);
  }, [groups.length]);

  useEffect(() => {
    if (groups.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, groups.length]);

  if (groups.length === 0) return null;

  return (
    <section
      className="relative w-full min-h-[60vh] overflow-hidden"
      aria-label="グループカルーセル"
    >
      {groups.map((group, i) => {
        const groupImages = carouselImages.filter(
          (img) => img.group_id === group.id
        );
        const imageUrl = groupImages[0]?.image_url;
        const colors = colorMap[group.color] || colorMap["#dc7280"];
        const isActive = i === current;

        return (
          <div
            key={group.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {imageUrl && !imageErrors.has(group.id) ? (
              <Image
                src={imageUrl}
                alt={group.name_ja}
                fill
                className="object-cover"
                priority={i === 0}
                onError={() => setImageErrors(prev => new Set(prev).add(group.id))}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                }}
              />
            )}
          </div>
        );
      })}

      {/* Content overlay */}
      <Link
        href={`/${locale}/about?group=${groups[current]?.slug}`}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-8 py-12"
      >
        {groups[current].logo_url && (
          <Image
            src={groups[current].logo_url!}
            alt={groups[current].name_ja}
            width={240}
            height={120}
            className="mb-6 drop-shadow-lg"
          />
        )}
        <h2
          className="text-3xl sm:text-4xl font-bold mb-3 drop-shadow-lg"
          style={{ color: "#ffffff" }}
        >
          {groups[current].name_ja}
        </h2>
        <p
          className="text-sm max-w-md mx-auto drop-shadow-md"
          style={{ color: "#ffffff" }}
        >
          {locale === "ja"
            ? groups[current].description_ja
            : groups[current].description_cn}
        </p>
      </Link>

      {/* Dot indicators */}
      {groups.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
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
      )}
    </section>
  );
}
