# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

イコノイジョイ (Ikonoijoy) — a bilingual (JP/CN) fan portal for three idol groups produced by 指原莉乃: =LOVE, ≠ME, and ≒JOY. Each group has its own brand color, official site, and YouTube channel. The site aggregates member profiles, videos, and group info across all three.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint (flat config, eslint.config.mjs)
npx tsc --noEmit   # Type-check without emitting
```

## Tech Stack

- **Next.js 16** App Router with **React 19** — prefer Server Components; add `"use client"` only for interactivity
- **TypeScript** (strict, `@/*` import alias → `src/`)
- **Tailwind CSS v4** — CSS-driven config via `@theme inline` in `globals.css`. No `tailwind.config.ts`. Uses `@tailwindcss/postcss` plugin
- **shadcn/ui v4** (`shadcn` package + `tw-animate-css`) — components in `src/components/ui/`
- **next-intl** for i18n — locales: `ja` (default), `zh`. Messages in `messages/`, middleware in `src/proxy.ts`
- **Supabase** (`@supabase/ssr`) — Postgres + file storage
- **Vercel** for deployment

**Important:** Next.js 16 has breaking changes vs 14/15. When writing Next.js code, check `node_modules/next/dist/docs/` for current APIs, caching semantics, and conventions.

## Architecture

**Data flow pattern:** Server Components read Supabase directly via `src/lib/data/*.ts`. Client Components (search, carousel, member grid) use API Routes at `/api/members`, `/api/groups`, `/api/videos` to support interactive filtering. The member search strips whitespace from queries to handle name variations.

**Route structure (App Router with i18n):**

```
/ja              → Homepage (carousel, group cards, video row)
/ja/members      → Member search + grid with detail modal
/ja/about        → Tabbed group introductions (?group=<slug> for deep linking)
/ja/videos       → Video gallery grid
/zh/...          → Chinese equivalents of all routes
```

**Key directories:**

- `src/lib/data/` — Server-side Supabase queries (groups, members, videos, carousel)
- `src/lib/supabase/` — Browser (`client.ts`) and server (`server.ts`) Supabase client factories
- `src/components/` — Feature folders: `carousel/`, `home/`, `member/`, `video/`, `about/`, `layout/`
- `src/i18n/` — `routing.ts` (locale config), `request.ts` (message loader)
- `messages/` — `ja.json`, `zh.json`
- `supabase/migrations/` — `001_initial_schema.sql` (schema + group seed data)

**Key config files:**

- `next.config.ts` — wraps config with `next-intl/plugin`
- `src/proxy.ts` — next-intl middleware (i18n routing and locale detection)
- `src/app/layout.tsx` — Root layout (metadata only, renders children as-is)
- `src/app/[locale]/layout.tsx` — Locale layout (NextIntlClientProvider, Navbar, Footer, flex column body)
- `eslint.config.mjs` — ESLint flat config using `eslint-config-next`
- `postcss.config.mjs` — PostCSS with `@tailwindcss/postcss`
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

**Database tables:** `groups`, `members`, `videos`, `carousel_images` — see `supabase/migrations/001_initial_schema.sql`.

## Design Decisions

- **Visual style:** Soft kawaii (柔和可爱风) — warm cream background (`#fffbf0`), brand colors used as pastel gradients
- **Group brand colors:** =LOVE `#dc7280`, ≠ME `#8bcabe`, ≒JOY `#fae06d`
- **Carousel:** Full-screen group display with CSS opacity crossfade transitions, auto-advances every 4s. No prev/next arrows in current version — uses dot indicators at bottom
- **Members:** Card grid (2-col mobile → 4-col desktop) with debounced search (300ms) and group filter pills. Click opens a shadcn Dialog modal with gradient header and member details
- **About:** Tab-based switching with `?group=<slug>` deep-link support. Each tab shows group logo, description, and external links (official site + YouTube)
- **Videos:** Horizontal scroll row (via ScrollArea) on homepage, responsive grid on `/videos`. Thumbnails link to YouTube. Sorted by `created_at` descending
- **Tailwind v4 theming:** Brand colors (`love`, `me`, `joy` and their `-light`/`-soft` variants), plus `bg-warm` and `border-soft` defined in `@theme inline` block in `globals.css`. CSS custom properties for shadcn/ui in `:root` block
