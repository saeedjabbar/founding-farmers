# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Next.js + Strapi CMS application for Founding Farmers - an editorial timeline storytelling platform. The monorepo contains:
- **frontend/** - Next.js 16 (App Router) with TypeScript
- **backend/** - Strapi 5.30.1 CMS with PostgreSQL
- **spec/** - Integration specs and checklists

## Common Development Commands

### Frontend (from `/frontend`)
```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (verify before PRs)
npm run lint         # ESLint formatting and import order
```

### Backend (from `/backend`)
```bash
npm install          # Install dependencies
npm run dev          # Start Strapi with autoReload at http://localhost:1337
npm run develop      # Alias for dev
npm run build        # Build admin panel
npm run start        # Production mode (no autoReload)

# Data migration
npm run strapi ts-node ./scripts/migrate-timeline-entries.ts
```

## Architecture

### Full-Stack Flow
1. **Strapi backend** serves as the headless CMS and source of truth for all content
2. **Frontend** fetches via REST API using `src/lib/strapi/client.ts` (`strapiFetch` wrapper)
3. **Content types:** Stories, Timeline Entries, Records (source documents), Standards, Privacy Policy
4. **Timeline Entries** are now a dedicated collection (not repeatable components) with many-to-many relations to Records
5. **URL routing** is managed by `strapi-plugin-webtools` with patterns seeded during bootstrap (`src/index.ts`)
6. **SEO metadata** comes from `@strapi/plugin-seo` (lowercase `seo` component on all content types)
7. **Sitemap generation** handled by `webtools-addon-sitemap` and proxied by Next.js at `/sitemap.xml`

### Frontend Architecture (Next.js 16 App Router)
- **Routes:** `src/app/**/page.tsx` - all use server components by default
- **Next.js 16 requires awaiting `params` and `searchParams`** as they are now Promise objects
- **Theming:** Editorial Red only (light/dark) via `useEditorialTheme` hook, controlled by `SiteHeader` toggle
- **Styling:** Tailwind CSS with custom `theme-*` classes (avoid hard-coded colors)
- **Rich text:** All narrative content uses Strapi Blocks (JSON) rendered by `@strapi/blocks-react-renderer`
- **Media handling:** Images, audio, video, PDFs via type-aware components (`PdfViewer`, `next/image`)

### Backend Architecture (Strapi)
- **Content types:** `src/api/` contains story, record, timeline-entry, standard, privacy-policy
- **Plugins:** SEO, Webtools (URL aliases), Webtools Sitemap addon
- **Bootstrap:** `src/index.ts` seeds default standards/privacy content, URL patterns, sitemap defaults, and backfills author names
- **Lifecycle hooks:** Stories auto-populate `authorName` on creation/update (hidden from API)
- **Media:** Served from `/uploads/*` on Strapi host (currently unoptimized in Next.js)

### Key Data Relationships
- **Story** → has many **Timeline Entries** (ordered by `position`, `entryDate`, `id`)
- **Timeline Entry** → has many **Records** (many-to-many)
- **Record** → has `searchableContent` (Blocks) for transcript-style sidebar with search highlighting

### Critical Integration Points
1. **Strapi queries must populate relations:**
   ```ts
   populate: {
     timelineEntries: {
       sort: ['position:asc', 'entryDate:asc', 'id:asc'],
       populate: { records: { populate: ['mediaAsset', 'videoEmbed'] } }
     }
   }
   ```

2. **Date handling:** Use `src/lib/dates.ts` helpers (`formatStrapiDate`, `parseStrapiDate`) to avoid timezone issues with date-only fields

3. **SEO:** All pages call `createPageMetadata()` with Strapi `seo` component data and optionally emit JSON-LD via `serializeStructuredData()`

4. **Search:** Record detail pages use `mark.js` for content highlighting with helpers in `src/lib/search.ts`

## Environment Configuration

### Frontend `.env.local`
```bash
STRAPI_BASE_URL=http://localhost:1337
STRAPI_API_TOKEN=<generate-in-strapi-admin>
NEXT_PUBLIC_SITE_URL=https://foundingfarmers.org
NEXT_PUBLIC_POSTHOG_KEY=<posthog-key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
MAILGUN_API_KEY=<mailgun-key>
MAILGUN_DOMAIN=<mailgun-domain>
MAILGUN_TO_EMAIL=<recipient>
```

### Backend `.env`
```bash
HOST=0.0.0.0
PORT=1337
DATABASE_CLIENT=postgres
# ... other Strapi secrets (APP_KEYS, JWT_SECRET, etc.)
WEBTOOLS_WEBSITE_URL=http://localhost:3000
SITEMAP_CRON=0 0 2 * * *
SITEMAP_AUTO_GENERATE=true
```

## Testing & QA Checklist
- Manual QA only (no automated tests yet)
- Test both editorial light/dark themes via header toggle
- Verify timeline scrolling in Chromium and Safari
- Run `npm run build` in frontend before requesting review
- Validate SEO: meta tags, canonical URLs, structured data

## Git Workflow
- Default branch for PRs: `strapi` (current branch)
- Commit style: Imperative subjects ≤50 chars (e.g., "Add submit form shell")
- PRs should scope to single features/bugs
- Include screenshots for UI changes
- Document affected routes and manual verification steps

## Important Conventions
- TypeScript only, 2-space indentation
- PascalCase components, camelCase hooks/utilities
- File names match default export
- ALWAYS prefer editing existing files over creating new ones
- Never use Markdown for rich text (Strapi Blocks only)
- All Strapi content is the source of truth
- Forms and interactive elements require proper labels and `aria-*` attributes

## Analytics & Monitoring
- PostHog initialized via `src/components/providers/PosthogProvider.tsx`
- Wraps App Router in `src/app/layout.tsx`
- Toolbar disabled by default in non-production
- Session recording opt-in via `NEXT_PUBLIC_POSTHOG_SESSION_RECORDING=true`

## Contact Form Integration
- `/submit` posts to `/api/submit/route.ts`
- Mailgun server-side delivery with text + HTML payloads
- Sandbox domains require verified recipients

## Reference Documentation
- `AGENTS.md` - Comprehensive agent guidelines (framework, project structure, theming)
- `frontend/FrontendGuidance.md` - Additional frontend patterns
- `spec/` - Integration specs and delivery plan
