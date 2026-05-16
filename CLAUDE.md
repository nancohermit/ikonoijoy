# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

イコノイジョイ (Ikonoijoy) — a bilingual (JP/CN) fan portal for three idol groups produced by 指原莉乃: =LOVE, ≠ME, and ≒JOY. Each group has its own brand color, official site, and YouTube channel. The site aggregates member profiles, videos, and group info across all three.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npx tsc --noEmit   # Type-check without emitting
```

## Tech Stack

- **Next.js 14** App Router (Server Components by default, Client Components where interactivity needed)
- **TypeScript** (strict, `@/*` import alias mapped to `src/`)
- **Tailwind CSS** with custom brand color tokens
- **shadcn/ui** component library
- **next-intl** for i18n (locales: `ja` default, `zh`)
- **Supabase** for data and storage (Postgres + file storage)
- **Vercel** for deployment

## Architecture

**Data flow pattern:** Server Components read Supabase directly via `src/lib/data/*.ts` functions. Client Components (search, carousel, member grid) fetch through API Routes at `/api/members`, `/api/groups`, `/api/videos` to support interactive filtering.

**Route structure (App Router with i18n):**
```
/ja              → Homepage (carousel, group cards, video row)
/ja/members      → Member search + grid with detail modal
/ja/about        → Tabbed group introductions
/ja/videos       → Video gallery grid
/zh/...          → Chinese equivalents of all routes
```

**Key directories:**
- `src/lib/data/` — Server-side Supabase query functions (groups, members, videos, carousel)
- `src/lib/supabase/` — Browser and server Supabase client factories (`@supabase/ssr`)
- `src/components/` — Feature folders: `carousel/`, `home/`, `member/`, `video/`, `about/`, `layout/`
- `src/i18n/` — next-intl routing config and request handler
- `messages/` — JSON translation files (`ja.json`, `zh.json`)
- `supabase/migrations/` — SQL migration files

**Database tables:** `groups`, `members`, `videos`, `carousel_images` (see migration for schema).

## Design Decisions

- **Visual style:** Soft kawaii (柔和可爱风) — warm cream background (`#fffbf0`), rounded corners (16px/24px), brand colors used as pastel gradients, heart emoji as decorative motif
- **Group brand colors:** =LOVE `#dc7280`, ≠ME `#8bcabe`, ≒JOY `#fae06d`
- **Carousel:** Full-screen single-group display, auto-advances every 4s, manual prev/next arrows + dot indicators
- **Members:** Card grid (2-col mobile → 4-col desktop) with search bar and group filter pills; click opens a modal
- **About:** Tab-based switching between groups, showing logo + description + external links
- **Videos:** Horizontal scroll row on homepage, responsive grid on dedicated page; thumbnails link to YouTube

## Implementation State

This project has NOT been scaffolded yet. The full implementation plan is at [docs/superpowers/plans/2026-05-16-ikonoijoy-website.md](docs/superpowers/plans/2026-05-16-ikonoijoy-website.md) with 19 sequential tasks. Start there for implementation.
