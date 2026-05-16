"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = pathname.startsWith("/zh") ? "zh" : "ja";

  const isActive = (path: string) => pathname === `/${locale}${path}`;

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      isActive(path)
        ? "text-love"
        : "text-gray-500 hover:text-love"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-border-soft">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-lg font-bold text-love">
            ♡ イコノイジョイ
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          <Link href={`/${locale}`} className={linkClass("")}>
            {t("home")}
          </Link>
          <Link href={`/${locale}/members`} className={linkClass("/members")}>
            {t("members")}
          </Link>
          <Link href={`/${locale}/about`} className={linkClass("/about")}>
            {t("about")}
          </Link>
          <Link href={`/${locale}/videos`} className={linkClass("/videos")}>
            {t("videos")}
          </Link>
        </div>

        <LanguageSwitcher />
      </div>
    </nav>
  );
}
