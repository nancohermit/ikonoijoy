"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getGroupColor } from "@/lib/design/colors";
import type { Group } from "@/types";

interface Props {
  groups: Group[];
  locale: string;
}

export default function GroupInfoCards({ groups, locale }: Props) {
  const t = useTranslations("home");

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-8 text-love">{t("aboutGroups")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {groups.map((group) => {
          const c = getGroupColor(group.color);
          return (
            <Link
              key={group.id}
              href={`/${locale}/about?group=${group.slug}`}
              className={`${c.bgLight} ${c.border} border rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform`}
            >
              {group.logo_url ? (
                <Image
                  src={group.logo_url}
                  alt={group.name_ja}
                  width={160}
                  height={40}
                  className="max-h-10 w-auto mx-auto mb-3 object-contain"
                />
              ) : (
                <div className="text-3xl mb-3">♡</div>
              )}
              <h3 className={`text-xl font-bold mb-2 ${c.text}`}>{group.name_ja}</h3>
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
