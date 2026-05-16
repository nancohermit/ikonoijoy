# イコノイジョイ Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (JP/CN) idol group fan website with group carousel, member search, video recommendations, and about pages.

**Architecture:** Next.js 14 App Router with next-intl for i18n. Supabase for data/storage. Server Components read Supabase directly for static content; Client Components fetch API Routes for search. shadcn/ui + Tailwind CSS for UI in soft-kawaii style.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, next-intl, Supabase JS SDK, Vercel deployment

---

### Task 1: Project Scaffolding

**Files:**
- Create: entire project via `create-next-app`

- [ ] **Step 1: Create Next.js project**

```bash
cd "c:/AIProject/イコノイジョイ"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

- [ ] **Step 2: Install dependencies**

```bash
cd "c:/AIProject/イコノイジョイ"
npm install next-intl @supabase/supabase-js @supabase/ssr
npm install -D @types/node
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
npx shadcn@latest add button dialog tabs input card scroll-area avatar
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Visit `http://localhost:3000` — should see default Next.js page.

- [ ] **Step 5: Commit**

```bash
git init
echo "node_modules/\n.next/\n.env\n.env.local" > .gitignore
echo ".superpowers/" >> .gitignore
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, shadcn/ui, next-intl, supabase"
```

---

### Task 2: TypeScript Type Definitions

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write types file**

```typescript
// src/types/index.ts

export interface Group {
  id: string;
  name_ja: string;
  name_cn: string;
  slug: string;
  color: string;
  logo_url: string | null;
  description_ja: string | null;
  description_cn: string | null;
  youtube_url: string | null;
  official_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Member {
  id: string;
  group_id: string;
  name_ja: string;
  name_cn: string | null;
  name_en: string | null;
  birthday: string | null;
  birthplace: string | null;
  height: string | null;
  blood_type: string | null;
  hobby_ja: string | null;
  hobby_cn: string | null;
  profile_image_url: string | null;
  gallery_images: GalleryImage[];
  sort_order: number;
  created_at: string;
  group?: Group;
}

export interface GalleryImage {
  url: string;
  caption_ja: string;
  caption_cn: string;
}

export interface Video {
  id: string;
  group_id: string | null;
  title_ja: string;
  title_cn: string | null;
  thumbnail_url: string;
  youtube_url: string;
  sort_order: number;
  created_at: string;
  group?: Group;
}

export interface CarouselImage {
  id: string;
  group_id: string;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface MembersResponse {
  data: Member[];
  total: number;
  page: number;
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions for all entities"
```

---

### Task 3: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `.env.local`

- [ ] **Step 1: Create browser client**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create env template**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/ .env.local
git commit -m "feat: add Supabase client and server utilities"
```

---

### Task 4: Database Migration SQL

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Write migration file**

```sql
-- supabase/migrations/001_initial_schema.sql

CREATE TABLE groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ja       TEXT NOT NULL,
  name_cn       TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  color         TEXT NOT NULL,
  logo_url      TEXT,
  description_ja TEXT,
  description_cn TEXT,
  youtube_url   TEXT,
  official_url  TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID REFERENCES groups(id) ON DELETE CASCADE,
  name_ja         TEXT NOT NULL,
  name_cn         TEXT,
  name_en         TEXT,
  birthday        DATE,
  birthplace      TEXT,
  height          TEXT,
  blood_type      TEXT,
  hobby_ja        TEXT,
  hobby_cn        TEXT,
  profile_image_url TEXT,
  gallery_images  JSONB DEFAULT '[]',
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID REFERENCES groups(id) ON DELETE SET NULL,
  title_ja      TEXT NOT NULL,
  title_cn      TEXT,
  thumbnail_url TEXT NOT NULL,
  youtube_url   TEXT NOT NULL,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE carousel_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID REFERENCES groups(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  link_url   TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_members_group_id ON members(group_id);
CREATE INDEX idx_members_name_ja ON members(name_ja);
CREATE INDEX idx_videos_group_id ON videos(group_id);
CREATE INDEX idx_carousel_group_id ON carousel_images(group_id);

-- Seed: three groups
INSERT INTO groups (name_ja, name_cn, slug, color, description_ja, description_cn, youtube_url, official_url, sort_order)
VALUES
  ('=LOVE', '=LOVE', 'equal-love', '#dc7280',
   '=LOVE（イコールラブ）は、指原莉乃プロデュースによる女性アイドルグループ。2017年結成。「愛」をテーマに活動中。',
   '=LOVE（等爱）是由指原莉乃制作的女性偶像团体。2017年成立，以"爱"为主题活动。',
   'https://www.youtube.com/@equallove_',
   'https://equal-love.jp', 1),
  ('≠ME', '≠ME', 'not-equal-me', '#8bcabe',
   '≠ME（ノットイコールミー）は、指原莉乃プロデュースによる女性アイドルグループ。2019年結成。',
   '≠ME（不等于我）是由指原莉乃制作的女性偶像团体。2019年成立。',
   'https://www.youtube.com/@notequalme6632',
   'https://not-equal-me.jp', 2),
  ('≒JOY', '≒JOY', 'nearly-equal-joy', '#fae06d',
   '≒JOY（ニアリーイコールジョイ）は、指原莉乃プロデュースによる女性アイドルグループ。2022年結成。',
   '≒JOY（约等于欢乐）是由指原莉乃制作的女性偶像团体。2022年成立。',
   'https://www.youtube.com/@nearlyequaljoy5843',
   'https://nearly-equal-joy.jp', 3);
```

- [ ] **Step 2: Run migration via Supabase CLI or Dashboard SQL Editor**

```bash
# Option A: Supabase CLI (if installed)
npx supabase db push

# Option B: Copy-paste into Supabase Dashboard SQL Editor
```

- [ ] **Step 3: Verify tables exist in Supabase Dashboard**

Go to Supabase Dashboard → Table Editor → should see `groups`, `members`, `videos`, `carousel_images` with seed data in `groups`.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add initial database migration with groups seed data"
```

---

### Task 5: i18n Configuration and Messages

**Files:**
- Create: `src/i18n/request.ts`
- Create: `src/i18n/routing.ts`
- Create: `src/middleware.ts`
- Create: `messages/ja.json`
- Create: `messages/zh.json`
- Modify: `next.config.ts` (or `next.config.mjs`)

- [ ] **Step 1: Create next-intl config files**

```typescript
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "zh"],
  defaultLocale: "ja",
  localePrefix: "always",
});

export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
```

```typescript
// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "ja" | "zh")) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 2: Create middleware**

```typescript
// src/middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 3: Write message files**

```json
// messages/ja.json
{
  "site": {
    "title": "イコノイジョイ",
    "subtitle": "指原莉乃プロデュース"
  },
  "nav": {
    "home": "ホーム",
    "members": "メンバー",
    "about": "グループ紹介",
    "videos": "動画"
  },
  "home": {
    "carouselAria": "グループカルーセル",
    "aboutGroups": "グループについて",
    "recommendedVideos": "おすすめ動画",
    "viewAllVideos": "すべての動画を見る"
  },
  "members": {
    "title": "メンバー一覧",
    "searchPlaceholder": "名前でメンバーを検索...",
    "allGroups": "すべて",
    "noResults": "メンバーが見つかりませんでした",
    "group": "所属グループ",
    "birthday": "誕生日",
    "birthplace": "出身地",
    "height": "身長",
    "bloodType": "血液型",
    "hobby": "趣味"
  },
  "about": {
    "title": "グループ紹介",
    "officialSite": "公式サイト",
    "youtube": "YouTube"
  },
  "videos": {
    "title": "動画一覧",
    "watchOnYoutube": "YouTubeで見る"
  },
  "footer": {
    "copyright": "© 2025 イコノイジョイ"
  }
}
```

```json
// messages/zh.json
{
  "site": {
    "title": "イコノイジョイ",
    "subtitle": "指原莉乃制作"
  },
  "nav": {
    "home": "首页",
    "members": "成员",
    "about": "组合介绍",
    "videos": "视频"
  },
  "home": {
    "carouselAria": "组合轮播",
    "aboutGroups": "关于组合",
    "recommendedVideos": "推荐视频",
    "viewAllVideos": "查看全部视频"
  },
  "members": {
    "title": "成员列表",
    "searchPlaceholder": "搜索成员名字...",
    "allGroups": "全部",
    "noResults": "未找到成员",
    "group": "所属组合",
    "birthday": "生日",
    "birthplace": "出身地",
    "height": "身高",
    "bloodType": "血型",
    "hobby": "爱好"
  },
  "about": {
    "title": "组合介绍",
    "officialSite": "官方网站",
    "youtube": "YouTube"
  },
  "videos": {
    "title": "视频列表",
    "watchOnYoutube": "在YouTube上观看"
  },
  "footer": {
    "copyright": "© 2025 イコノイジョイ"
  }
}
```

- [ ] **Step 4: Update next.config**

```typescript
// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Verify i18n routing works**

```bash
npm run dev
```

Visit `http://localhost:3000/ja` and `http://localhost:3000/zh` — should load without errors. (Pages won't render content yet, but routing should work.)

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ src/middleware.ts messages/ next.config.ts
git commit -m "feat: configure next-intl with JP/CN locales and message files"
```

---

### Task 6: Root Layout and Locale Layout

**Files:**
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/page.tsx`
- Create: `src/app/layout.tsx` (may already exist)
- Remove/update: default `src/app/page.tsx` if exists

- [ ] **Step 1: Write root layout**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "イコノイジョイ",
  description: "=LOVE・≠ME・≒JOY 総合サイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

- [ ] **Step 2: Write locale layout**

```typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "イコノイジョイ",
  description: "=LOVE・≠ME・≒JOY 総合サイト",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ja" | "zh")) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-[#fffbf0] font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Write placeholder homepage**

```typescript
// src/app/[locale]/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold text-pink-400">イコノイジョイ</h1>
    </main>
  );
}
```

- [ ] **Step 4: Update Tailwind config with brand colors**

Read `tailwind.config.ts` first, then edit:

```typescript
// tailwind.config.ts — extend colors:
{
  theme: {
    extend: {
      colors: {
        "love": "#dc7280",
        "love-light": "#ffe0e5",
        "love-soft": "#ffd0d8",
        "me": "#8bcabe",
        "me-light": "#d5f0ed",
        "me-soft": "#c0e8e4",
        "joy": "#fae06d",
        "joy-light": "#fff6d5",
        "joy-soft": "#ffeeaa",
        "bg-warm": "#fffbf0",
        "border-soft": "#f0d0d0",
      },
      borderRadius: {
        "xl": "16px",
        "2xl": "24px",
      },
    },
  },
}
```

Edit `tailwind.config.ts` to add the `colors` and `borderRadius` extensions under the existing `extend` key (merge with existing extend if present).

- [ ] **Step 5: Verify dev server**

```bash
npm run dev
```

Visit `http://localhost:3000/ja` — should see warm background with "イコノイジョイ" heading.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx "src/app/[locale]/" tailwind.config.ts
git commit -m "feat: add root layout, locale layout, and brand color palette"
```

---

### Task 7: Navbar Component

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/LanguageSwitcher.tsx`

- [ ] **Step 1: Write LanguageSwitcher**

```typescript
// src/components/layout/LanguageSwitcher.tsx
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
        className={currentLocale === "ja" ? "bg-love text-white hover:bg-love/90 rounded-full text-xs h-8" : "text-gray-500 hover:text-love rounded-full text-xs h-8"}
      >
        JP
      </Button>
      <Button
        variant={currentLocale === "zh" ? "default" : "ghost"}
        size="sm"
        onClick={() => switchTo("zh")}
        className={currentLocale === "zh" ? "bg-love text-white hover:bg-love/90 rounded-full text-xs h-8" : "text-gray-500 hover:text-love rounded-full text-xs h-8"}
      >
        CN
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Write Navbar**

```typescript
// src/components/layout/Navbar.tsx
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
          <span className="text-lg font-bold text-love">♡ イコノイジョイ</span>
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
```

- [ ] **Step 3: Verify Navbar appears**

Update `src/app/[locale]/layout.tsx` to include Navbar:

```typescript
// Add import after existing imports:
import Navbar from "@/components/layout/Navbar";

// Add <Navbar /> before {children} in the body
```

```bash
npm run dev
```

Visit `http://localhost:3000/ja` — should see sticky Navbar with links and language switcher.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/LanguageSwitcher.tsx "src/app/[locale]/layout.tsx"
git commit -m "feat: add Navbar with language switcher and navigation links"
```

---

### Task 8: Footer Component

**Files:**
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Write Footer**

```typescript
// src/components/layout/Footer.tsx
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border-soft bg-white/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        <p>{t("copyright")}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Add Footer to locale layout**

Edit `src/app/[locale]/layout.tsx`:

```typescript
import Footer from "@/components/layout/Footer";
// Add <Footer /> after {children}, inside the body but after all content
```

Set up the body as a flex column:

```tsx
<body className="min-h-screen bg-[#fffbf0] font-sans antialiased flex flex-col">
  <NextIntlClientProvider messages={messages}>
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </NextIntlClientProvider>
</body>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx "src/app/[locale]/layout.tsx"
git commit -m "feat: add Footer component"
```

---

### Task 9: Data Access Layer — Server Queries

**Files:**
- Create: `src/lib/data/groups.ts`
- Create: `src/lib/data/members.ts`
- Create: `src/lib/data/videos.ts`
- Create: `src/lib/data/carousel.ts`

- [ ] **Step 1: Write groups data access**

```typescript
// src/lib/data/groups.ts
import { createClient } from "@/lib/supabase/server";
import type { Group } from "@/types";

export async function getAllGroups(): Promise<Group[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getGroupBySlug(slug: string): Promise<Group | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}
```

- [ ] **Step 2: Write members data access**

```typescript
// src/lib/data/members.ts
import { createClient } from "@/lib/supabase/server";
import type { Member, MembersResponse } from "@/types";

export async function searchMembers(params: {
  search?: string;
  group?: string;
  page?: number;
  limit?: number;
}): Promise<MembersResponse> {
  const supabase = await createClient();
  const { search, group, page = 1, limit = 20 } = params;

  let query = supabase
    .from("members")
    .select("*, group:groups(*)", { count: "exact" })
    .order("sort_order", { ascending: true });

  if (search) {
    query = query.or(
      `name_ja.ilike.%${search}%,name_cn.ilike.%${search}%,name_en.ilike.%${search}%`
    );
  }

  if (group && group !== "all") {
    query = query.eq("groups.slug", group);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  return { data: (data as Member[]) ?? [], total: count ?? 0, page };
}

export async function getMemberById(id: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("*, group:groups(*)")
    .eq("id", id)
    .single();
  return data as Member | null;
}
```

- [ ] **Step 3: Write videos data access**

```typescript
// src/lib/data/videos.ts
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/types";

export async function getVideos(groupSlug?: string, limit?: number): Promise<Video[]> {
  const supabase = await createClient();
  let query = supabase
    .from("videos")
    .select("*, group:groups(*)")
    .order("sort_order", { ascending: true });

  if (groupSlug) {
    query = query.eq("groups.slug", groupSlug);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;
  return (data as Video[]) ?? [];
}
```

- [ ] **Step 4: Write carousel data access**

```typescript
// src/lib/data/carousel.ts
import { createClient } from "@/lib/supabase/server";
import type { CarouselImage } from "@/types";

export async function getCarouselsByGroup(groupId: string): Promise<CarouselImage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("carousel_images")
    .select("*")
    .eq("group_id", groupId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}
```

- [ ] **Step 5: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/data/
git commit -m "feat: add server data access layer for groups, members, videos, carousel"
```

---

### Task 10: API Routes

**Files:**
- Create: `src/app/api/members/route.ts`
- Create: `src/app/api/members/[id]/route.ts`
- Create: `src/app/api/groups/route.ts`
- Create: `src/app/api/groups/[slug]/route.ts`
- Create: `src/app/api/videos/route.ts`

- [ ] **Step 1: Write GET /api/members**

```typescript
// src/app/api/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchMembers } from "@/lib/data/members";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const group = searchParams.get("group") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const result = await searchMembers({ search, group, page, limit });
  return NextResponse.json(result);
}
```

- [ ] **Step 2: Write GET /api/members/[id]**

```typescript
// src/app/api/members/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMemberById } from "@/lib/data/members";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: member });
}
```

- [ ] **Step 3: Write GET /api/groups and GET /api/groups/[slug]**

```typescript
// src/app/api/groups/route.ts
import { NextResponse } from "next/server";
import { getAllGroups } from "@/lib/data/groups";

export async function GET() {
  const groups = await getAllGroups();
  return NextResponse.json({ data: groups });
}
```

```typescript
// src/app/api/groups/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGroupBySlug } from "@/lib/data/groups";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const group = await getGroupBySlug(slug);
  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: group });
}
```

- [ ] **Step 4: Write GET /api/videos**

```typescript
// src/app/api/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getVideos } from "@/lib/data/videos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group") ?? undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!)
    : undefined;

  const videos = await getVideos(group, limit);
  return NextResponse.json({ data: videos });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/
git commit -m "feat: add API routes for members, groups, and videos"
```

---

### Task 11: Home Page — Group Carousel

**Files:**
- Create: `src/components/carousel/GroupCarousel.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Write GroupCarousel**

```typescript
// src/components/carousel/GroupCarousel.tsx
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
        onClick={prev}
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
```

- [ ] **Step 2: Update homepage to use carousel**

```typescript
// src/app/[locale]/page.tsx
import { getAllGroups } from "@/lib/data/groups";
import GroupCarousel from "@/components/carousel/GroupCarousel";

export default async function HomePage() {
  const groups = await getAllGroups();
  return (
    <div>
      <GroupCarousel groups={groups} />
    </div>
  );
}
```

- [ ] **Step 3: Verify carousel displays**

```bash
npm run dev
```

Visit `http://localhost:3000/ja` — should see full-screen carousel cycling through 3 groups with brand colors, auto-advancing every 4s.

- [ ] **Step 4: Commit**

```bash
git add src/components/carousel/GroupCarousel.tsx "src/app/[locale]/page.tsx"
git commit -m "feat: add full-screen group carousel with auto-play and manual controls"
```

---

### Task 12: Home Page — Group Info Cards and Video Row

**Files:**
- Create: `src/components/home/GroupInfoCards.tsx`
- Create: `src/components/video/VideoCard.tsx`
- Create: `src/components/video/VideoRow.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Write GroupInfoCards**

```typescript
// src/components/home/GroupInfoCards.tsx
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
      <h2 className="text-2xl font-bold text-center mb-8 text-love">♡ {t("aboutGroups")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {groups.map((group) => {
          const s = colorStyles[group.color] || colorStyles["#dc7280"];
          return (
            <Link
              key={group.id}
              href={`/${locale}/about?group=${group.slug}`}
              className={`${s.bg} ${s.border} border rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform`}
            >
              <div className="text-3xl mb-3" style={{ color: s.text.split("[")[1]?.replace("]", "") || "#b06070" }}>
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
```

- [ ] **Step 2: Write VideoCard**

```typescript
// src/components/video/VideoCard.tsx
import Image from "next/image";
import type { Video } from "@/types";

interface Props {
  video: Video;
  locale: string;
}

export default function VideoCard({ video, locale }: Props) {
  const title = locale === "zh" && video.title_cn ? video.title_cn : video.title_ja;

  return (
    <a
      href={video.youtube_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-48 sm:w-56 group"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden border border-border-soft bg-gray-100">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
            ▶
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-600 line-clamp-2 group-hover:text-love transition-colors">
        {title}
      </p>
    </a>
  );
}
```

- [ ] **Step 3: Write VideoRow**

```typescript
// src/components/video/VideoRow.tsx
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Video } from "@/types";
import VideoCard from "./VideoCard";

interface Props {
  videos: Video[];
  locale: string;
}

export default function VideoRow({ videos, locale }: Props) {
  const t = useTranslations("home");
  const pathname = `/${locale}`;

  if (videos.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-love">♡ {t("recommendedVideos")}</h2>
        <Link
          href={`${pathname}/videos`}
          className="text-sm text-love hover:underline"
        >
          {t("viewAllVideos")} →
        </Link>
      </div>
      <ScrollArea>
        <div className="flex gap-4 pb-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} locale={locale} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
```

- [ ] **Step 4: Update homepage with all sections**

```typescript
// src/app/[locale]/page.tsx
import { getAllGroups } from "@/lib/data/groups";
import { getVideos } from "@/lib/data/videos";
import GroupCarousel from "@/components/carousel/GroupCarousel";
import GroupInfoCards from "@/components/home/GroupInfoCards";
import VideoRow from "@/components/video/VideoRow";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [groups, videos] = await Promise.all([
    getAllGroups(),
    getVideos(undefined, 8),
  ]);

  return (
    <div>
      <GroupCarousel groups={groups} />
      <GroupInfoCards groups={groups} locale={locale} />
      <VideoRow videos={videos} locale={locale} />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/home/ src/components/video/ "src/app/[locale]/page.tsx"
git commit -m "feat: add group info cards and horizontal video row to homepage"
```

---

### Task 13: Members Page

**Files:**
- Create: `src/components/member/MemberCard.tsx`
- Create: `src/components/member/MemberGrid.tsx`
- Create: `src/components/member/MemberDetailModal.tsx`
- Create: `src/app/[locale]/members/page.tsx`

- [ ] **Step 1: Write MemberCard**

```typescript
// src/components/member/MemberCard.tsx
import type { Member } from "@/types";

interface Props {
  member: Member;
  onClick: (member: Member) => void;
}

export default function MemberCard({ member, onClick }: Props) {
  const groupColorMap: Record<string, string> = {
    "#dc7280": "bg-love-light",
    "#8bcabe": "bg-me-light",
    "#fae06d": "bg-joy-light",
  };
  const bgClass = groupColorMap[member.group?.color ?? ""] ?? "bg-love-light";

  return (
    <button
      onClick={() => onClick(member)}
      className="bg-white rounded-2xl p-4 text-center border border-border-soft hover:shadow-md hover:scale-[1.02] transition-all w-full"
    >
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 ${bgClass} rounded-full mx-auto mb-3 flex items-center justify-center text-2xl`}
      >
        {member.profile_image_url ? (
          <img
            src={member.profile_image_url}
            alt={member.name_ja}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          "♡"
        )}
      </div>
      <p className="text-sm font-bold text-gray-700">{member.name_ja}</p>
      {member.name_cn && (
        <p className="text-xs text-gray-400 mt-0.5">{member.name_cn}</p>
      )}
      {member.group && (
        <span
          className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] text-white"
          style={{ backgroundColor: member.group.color }}
        >
          {member.group.name_ja}
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Write MemberDetailModal**

```typescript
// src/components/member/MemberDetailModal.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Member } from "@/types";

interface Props {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MemberDetailModal({ member, open, onOpenChange }: Props) {
  const t = useTranslations("members");
  const locale = useLocale();

  if (!member) return null;

  const groupColorMap: Record<string, { from: string; to: string; text: string }> = {
    "#dc7280": { from: "#ffe0e5", to: "#ffd0d8", text: "#b06070" },
    "#8bcabe": { from: "#d5f0ed", to: "#c0e8e4", text: "#509090" },
    "#fae06d": { from: "#fff6d5", to: "#ffeeaa", text: "#b09020" },
  };
  const colors = groupColorMap[member.group?.color ?? ""] || groupColorMap["#dc7280"];

  const infoItems: { label: string; value: string | null | undefined }[] = [
    { label: t("group"), value: member.group?.name_ja },
    { label: t("birthday"), value: member.birthday },
    { label: t("birthplace"), value: locale === "zh" ? member.birthplace : member.birthplace },
    { label: t("height"), value: member.height },
    { label: t("bloodType"), value: member.blood_type },
    { label: t("hobby"), value: locale === "zh" && member.hobby_cn ? member.hobby_cn : member.hobby_ja },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl border-border-soft">
        <DialogHeader>
          <div
            className="-mx-6 -mt-6 pt-10 pb-8 text-center rounded-t-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            }}
          >
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
              {member.profile_image_url ? (
                <img
                  src={member.profile_image_url}
                  alt={member.name_ja}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "♡"
              )}
            </div>
            <DialogTitle className="text-xl font-bold" style={{ color: colors.text }}>
              {member.name_ja}
            </DialogTitle>
            {member.name_cn && (
              <p className="text-xs mt-1 opacity-70" style={{ color: colors.text }}>
                {member.name_cn}
              </p>
            )}
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {infoItems.map(
            (item) =>
              item.value && (
                <div key={item.label}>
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                  <p className="text-sm text-gray-700">{item.value}</p>
                </div>
              )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Write MemberGrid**

```typescript
// src/components/member/MemberGrid.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import type { Member, MembersResponse } from "@/types";
import MemberCard from "./MemberCard";
import MemberDetailModal from "./MemberDetailModal";

interface Props {
  groups: { slug: string; name_ja: string; color: string }[];
  locale: string;
}

export default function MemberGrid({ groups, locale }: Props) {
  const t = useTranslations("members");
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeGroup !== "all") params.set("group", activeGroup);
      params.set("limit", "50");

      const res = await fetch(`/api/members?${params.toString()}`);
      const json: MembersResponse = await res.json();
      setMembers(json.data);
      setLoading(false);
    };

    const debounce = setTimeout(fetchMembers, 300);
    return () => clearTimeout(debounce);
  }, [search, activeGroup]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-love">
        ♡ {t("title")}
      </h1>

      <div className="mb-6">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm mx-auto rounded-full border-2 border-border-soft focus:border-love text-sm h-10"
        />
      </div>

      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        <button
          onClick={() => setActiveGroup("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeGroup === "all"
              ? "bg-love text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {t("allGroups")}
        </button>
        {groups.map((g) => (
          <button
            key={g.slug}
            onClick={() => setActiveGroup(g.slug)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeGroup === g.slug
                ? "text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            style={
              activeGroup === g.slug ? { backgroundColor: g.color } : undefined
            }
          >
            {g.name_ja}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : members.length === 0 ? (
        <div className="text-center text-gray-400 py-12">{t("noResults")}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onClick={(member) => {
                setSelectedMember(member);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <MemberDetailModal
        member={selectedMember}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
```

- [ ] **Step 4: Write members page**

```typescript
// src/app/[locale]/members/page.tsx
import { getAllGroups } from "@/lib/data/groups";
import MemberGrid from "@/components/member/MemberGrid";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const groups = await getAllGroups();

  return (
    <MemberGrid
      groups={groups.map((g) => ({
        slug: g.slug,
        name_ja: g.name_ja,
        color: g.color,
      }))}
      locale={locale}
    />
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/member/ "src/app/[locale]/members/"
git commit -m "feat: add members page with search, group filter, card grid, and detail modal"
```

---

### Task 14: About Page

**Files:**
- Create: `src/components/about/GroupTabs.tsx`
- Create: `src/app/[locale]/about/page.tsx`

- [ ] **Step 1: Write GroupTabs**

```typescript
// src/components/about/GroupTabs.tsx
"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Group } from "@/types";

interface Props {
  groups: Group[];
  locale: string;
  defaultGroup?: string;
}

export default function GroupTabs({ groups, locale, defaultGroup }: Props) {
  const t = useTranslations("about");
  const defaultTab = defaultGroup || groups[0]?.slug;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-love">
        ♡ {t("title")}
      </h1>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex justify-center gap-2 bg-transparent mb-8">
          {groups.map((group) => (
            <TabsTrigger
              key={group.slug}
              value={group.slug}
              className="rounded-full px-5 py-2 data-[state=active]:text-white text-sm transition-colors"
              style={{
                backgroundColor: "transparent",
                color: group.color,
                border: `2px solid ${group.color}`,
              }}
              // Active state handled via shadcn data-state
            />
          ))}
        </TabsList>
        {groups.map((group) => (
          <TabsContent key={group.slug} value={group.slug}>
            <div className="text-center">
              {group.logo_url && (
                <img
                  src={group.logo_url}
                  alt={group.name_ja}
                  className="max-h-20 mx-auto mb-6"
                />
              )}
              <div className="text-4xl mb-4">♡</div>
              <h2 className="text-xl font-bold mb-4" style={{ color: group.color }}>
                {group.name_ja}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto mb-8">
                {locale === "ja" ? group.description_ja : group.description_cn}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {group.official_url && (
                  <a
                    href={group.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-5 py-2 rounded-full text-white text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: group.color }}
                  >
                    {t("officialSite")} →
                  </a>
                )}
                {group.youtube_url && (
                  <a
                    href={group.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-5 py-2 rounded-full text-white text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#ff0000" }}
                  >
                    {t("youtube")} →
                  </a>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Write about page**

```typescript
// src/app/[locale]/about/page.tsx
import { getAllGroups } from "@/lib/data/groups";
import GroupTabs from "@/components/about/GroupTabs";

export default async function AboutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  const { locale } = await params;
  const { group } = await searchParams;
  const groups = await getAllGroups();

  return <GroupTabs groups={groups} locale={locale} defaultGroup={group} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/about/ "src/app/[locale]/about/"
git commit -m "feat: add about page with tabbed group introductions"
```

---

### Task 15: Videos Page

**Files:**
- Create: `src/app/[locale]/videos/page.tsx`

- [ ] **Step 1: Write videos page**

```typescript
// src/app/[locale]/videos/page.tsx
import { useTranslations } from "next-intl";
import { getVideos } from "@/lib/data/videos";
import VideoCard from "@/components/video/VideoCard";

export default async function VideosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = (await import(`@/../messages/${locale}.json`)).default;

  const videos = await getVideos();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-love">
        ♡ {t.videos.title}
      </h1>

      {videos.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/[locale]/videos/"
git commit -m "feat: add videos page with responsive grid layout"
```

---

### Task 16: Global CSS Polish and shadcn/ui Theme

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update globals.css with kawaii theme variables**

Read current `globals.css` first, then replace with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 39 100% 97%;
    --foreground: 0 0% 20%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 20%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 20%;
    --primary: 354 58% 65%;
    --primary-foreground: 0 0% 100%;
    --secondary: 174 40% 67%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 55%;
    --accent: 48 89% 64%;
    --accent-foreground: 0 0% 20%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 45% 88%;
    --input: 0 45% 88%;
    --ring: 354 58% 65%;
    --radius: 1rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Scrollbar styling for video row */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

- [ ] **Step 2: Create shared metadata for all pages**

Add metadata to each page route. For brevity, the locale layout already covers the global metadata.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: apply kawaii theme with shadcn/ui CSS variables and warm background"
```

---

### Task 17: Responsive Polish

**Files:**
- Modify: `src/components/layout/Navbar.tsx` (add mobile hamburger)
- Modify: relevant component files as needed

- [ ] **Step 1: Add mobile hamburger menu to Navbar**

```typescript
// Add these imports to existing Navbar.tsx:
import { useState } from "react";
import { Menu, X } from "lucide-react";

// Add state inside the component:
const [mobileOpen, setMobileOpen] = useState(false);

// Add hamburger button between the desktop nav and LanguageSwitcher:
<button
  className="sm:hidden p-2 text-gray-500"
  onClick={() => setMobileOpen(!mobileOpen)}
>
  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
</button>

// Add mobile menu drawer after the main nav:
{mobileOpen && (
  <div className="sm:hidden absolute top-14 left-0 right-0 bg-white border-b border-border-soft shadow-lg">
    <div className="flex flex-col p-4 gap-3">
      <Link href={`/${locale}`} className={linkClass("")} onClick={() => setMobileOpen(false)}>
        {t("home")}
      </Link>
      <Link href={`/${locale}/members`} className={linkClass("/members")} onClick={() => setMobileOpen(false)}>
        {t("members")}
      </Link>
      <Link href={`/${locale}/about`} className={linkClass("/about")} onClick={() => setMobileOpen(false)}>
        {t("about")}
      </Link>
      <Link href={`/${locale}/videos`} className={linkClass("/videos")} onClick={() => setMobileOpen(false)}>
        {t("videos")}
      </Link>
    </div>
  </div>
)}
```

- [ ] **Step 2: Verify responsive behavior**

```bash
npm run dev
```

Test on Chrome DevTools at 375px, 768px, 1440px:
- Mobile: hamburger menu visible, carousel full-width, members 2-column grid, videos single column
- Tablet: nav links visible (no hamburger), 3-column members, 2-column videos
- Desktop: full layout, 4-column members, 3-column videos

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: add responsive hamburger menu for mobile navigation"
```

---

### Task 18: Final Integration and Verification

- [ ] **Step 1: Run full type check**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Start production server and smoke test**

```bash
npm run start
```

- Visit `http://localhost:3000/ja` — homepage with carousel, group cards, video row
- `http://localhost:3000/zh` — Chinese version, all content switched
- `http://localhost:3000/ja/members` — member search and grid
- `http://localhost:3000/ja/about` — tabbed group info
- `http://localhost:3000/ja/videos` — video grid
- Language switcher toggles between locales
- Carousel auto-advances and responds to clicks
- Member search filters results
- Group filter tabs filter members

- [ ] **Step 4: Add Supabase env vars for deployment and commit final**

```bash
git add -A
git commit -m "feat: complete ikonoijoy website — bilingual idol group fan portal"
```

---

### Task 19: Deploy to Vercel

- [ ] **Step 1: Install Vercel CLI if needed**

```bash
npm i -g vercel
```

- [ ] **Step 2: Deploy**

```bash
vercel --prod
```

During setup:
- Set framework to Next.js
- Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Step 3: Verify production**

Visit the deployed URL. All pages should load with data from Supabase. Test carousel, search, language switching.

- [ ] **Step 4: Commit any deploy config**

```bash
git add -A
git commit -m "chore: add Vercel deployment configuration"
```
