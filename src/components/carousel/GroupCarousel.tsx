"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Group } from "@/types";

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

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  if (groups.length === 0) return null;

  const colorMap: Record<string, { from: string; to: string; text: string }> = {
    "#dc7280": { from: "#ffe0e5", to: "#ffd0d8", text: "#b06070" },
    "#8bcabe": { from: "#d5f0ed", to: "#c0e8e4", text: "#509090" },
    "#fae06d": { from: "#fff6d5", to: "#ffeeaa", text: "#b09020" },
  };

  return (
    <section
      className="relative w-full min-h-[60vh] overflow-hidden"
      aria-label="グループカルーセル"
    >
      {groups.map((group, i) => {
        const colors = colorMap[group.color] || colorMap["#dc7280"];
        const isActive = i === current;

        return (
          <Link
            key={group.id}
            href={`/${locale}/about?group=${group.slug}`}
            className={`absolute inset-0 flex items-center justify-center text-center px-8 py-12 transition-opacity duration-1000 ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            }}
          >
            {group.logo_url && (
              <Image
                src={group.logo_url}
                alt={group.name_ja}
                width={240}
                height={120}
                className="mx-auto mb-6"
              />
            )}
            {/* only name + desc for active slide below logo */}
          </Link>
        );
      })}

      {/* Content overlay for active group */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="text-center px-8 py-12">
          {groups[current].logo_url && (
            <Image
              src={groups[current].logo_url}
              alt={groups[current].name_ja}
              width={240}
              height={120}
              className="mx-auto mb-6"
            />
          )}
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: colorMap[groups[current].color]?.text || "#b06070" }}
          >
            {groups[current].name_ja}
          </h2>
          <p
            className="text-sm opacity-70 max-w-md mx-auto"
            style={{ color: colorMap[groups[current].color]?.text || "#b06070" }}
          >
            {locale === "ja"
              ? groups[current].description_ja
              : groups[current].description_cn}
          </p>
        </div>
      </div>
    </section>
  );
}
