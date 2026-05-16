"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Group } from "@/types";

interface Props {
  groups: Group[];
  locale: string;
}

export default function GroupInfoCards({ groups, locale }: Props) {
  const t = useTranslations("home");

  const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
    "#dc7280": { bg: "bg-love-light", text: "text-[#b06070]", border: "border-love/20" },
    "#8bcabe": { bg: "bg-me-light", text: "text-[#509090]", border: "border-me/20" },
    "#fae06d": { bg: "bg-joy-light", text: "text-[#b09020]", border: "border-joy/20" },
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-8 text-love">{t("aboutGroups")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {groups.map((group) => {
          const s = colorStyles[group.color] || colorStyles["#dc7280"];
          return (
            <Link
              key={group.id}
              href={`/${locale}/about?group=${group.slug}`}
              className={`${s.bg} ${s.border} border rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform`}
            >
              <div className="text-3xl mb-3" style={{ color: s.text.replace(/\[|\]/g, "") }}>
                ♡
              </div>
              <h3 className={`text-xl font-bold mb-2 ${s.text}`}>{group.name_ja}</h3>
              <p className="text-xs text-gray-500 line-clamp-3">
                {locale === "ja" ? group.description_ja : group.description_cn}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
