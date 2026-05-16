"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.startsWith("/zh") ? "zh" : "ja";

  const switchTo = (locale: string) => {
    const newPath = pathname.replace(/^\/(ja|zh)/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <div className="flex gap-1">
      <Button
        variant={currentLocale === "ja" ? "default" : "ghost"}
        size="sm"
        onClick={() => switchTo("ja")}
        className={
          currentLocale === "ja"
            ? "bg-love text-white hover:bg-love/90 rounded-full text-xs h-8"
            : "text-gray-500 hover:text-love rounded-full text-xs h-8"
        }
      >
        JP
      </Button>
      <Button
        variant={currentLocale === "zh" ? "default" : "ghost"}
        size="sm"
        onClick={() => switchTo("zh")}
        className={
          currentLocale === "zh"
            ? "bg-love text-white hover:bg-love/90 rounded-full text-xs h-8"
            : "text-gray-500 hover:text-love rounded-full text-xs h-8"
        }
      >
        CN
      </Button>
    </div>
  );
}
