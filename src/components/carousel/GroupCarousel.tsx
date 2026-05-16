"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Group, CarouselImage } from "@/types";

interface Props {
  groups: Group[];
  carouselImages: CarouselImage[];
}

const colorMap: Record<string, { from: string; to: string }> = {
  "#dc7280": { from: "#ffe0e5", to: "#dc7280" },
  "#8bcabe": { from: "#d5f0ed", to: "#8bcabe" },
  "#fae06d": { from: "#fff6d5", to: "#fae06d" },
};

export default function GroupCarousel({ groups, carouselImages }: Props) {
  const [current, setCurrent] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "16 / 9.4", maxHeight: "80vh" }}
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
            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 px-4 ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Logo + name above the image */}
            <div className="flex items-center gap-2 mb-2">
              {group.logo_url && (
                <Image
                  src={group.logo_url}
                  alt={group.name_ja}
                  width={28}
                  height={28}
                  className="object-contain"
                />
              )}
              <span
                className="text-base font-bold"
                style={{ color: group.color }}
              >
                {group.name_ja}
              </span>
            </div>

            {/* Image area */}
            <div
              className="relative w-full overflow-hidden rounded-xl"
              style={{ aspectRatio: "16 / 9", maxHeight: "70vh" }}
            >
              {imageUrl && !imageErrors.has(group.id) ? (
                <Image
                  src={imageUrl}
                  alt={group.name_ja}
                  fill
                  className="object-contain"
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
          </div>
        );
      })}

      {/* Dot indicators */}
      {groups.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {groups.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? "bg-gray-800 scale-110" : "bg-gray-400/60"
              }`}
              aria-label={`グループ${i + 1}に切り替え`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
