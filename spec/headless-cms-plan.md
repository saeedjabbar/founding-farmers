# Headless CMS Delivery Plan

## 0. Alignment & Kickoff
- [ ] Confirm existing Strapi deployment footprint under `/backend` (Postgres connection, hosting).
- [ ] Inventory existing story/timeline/record data sources and file formats.
- [ ] Capture editorial workflow requirements (draft vs. published, roles, approval).
- [ ] Agree on URL structure for stories and records in Next.js.

## 1. Strapi Audit & Schema Configuration
- [x] Review existing Strapi project under `/backend` and confirm Postgres connection details.
- [x] Audit current content-types and components; document gaps relative to the story/timeline/record model.
- [ ] Enable or verify GraphQL/REST plugins required for the frontend integration.
- [x] Define or update reusable components for Timeline Entry and Source Record references.
- [x] Adjust collection types as needed:
  - [x] `stories` with fields: `title`, `slug`, `blurb`, hidden `authorName`, `published_at`, `heroMedia?`, `timelineEntries` (repeatable component), optional `summaryEnabled` toggle, and embedded `summaryCard` (heading, Blocks rich text body, newline-separated bullets).
  - [x] `records` with fields: `title`, `slug`, Blocks rich-text `description`, `mediaAsset (media)`, `mediaType (enum)`, `sourceUrl`, `publishDate`.
- [x] Ensure `timelineEntry` component includes `entryDate (date)`, `headline`, `body`, `records (relation -> records)`.
- [x] Auto-populate hidden `authorName` for all roles via lifecycle (after create/update) and bootstrap backfill (username → name → email prefix fallback).
- [ ] Configure default & authenticated roles so public API only exposes published content.
- [ ] Seed or migrate initial content fixtures for QA using the existing Strapi admin.

## 2. Content & Media Operations
- [x] Import sample stories, timeline entries, and records; ensure shared records can link to multiple stories.
- [x] Upload representative image assets to Strapi media library (audio/PDF uploads pending direct support).
- [ ] Validate media processing (image thumbnails, PDF preview links, audio/video transcoding if needed).
- [ ] Document editorial workflow for creating new records and associating them with stories, including guidance for the story summary toggle (leave disabled by default; enable when body/bullets are provided). Reinforce that all narrative fields must be authored with the Blocks editor (no Markdown).
- [ ] Establish versioning/backups strategy (database export schedule or managed DB).

## 3. Next.js Data Layer Integration
- [ ] Add Strapi base URL and tokens to Next.js runtime config (`env.local` & `next.config`).
- [x] Implement `src/lib/strapi/client.ts` with fetch helpers (REST or GraphQL) including draft/published toggle.
- [x] Create typed DTOs (e.g., `Story`, `TimelineEntry`, `Record`) and mapping utilities from Strapi responses.
- [x] Build story listing fetcher for landing pages (`/stories`).
  - [x] Apply Strapi pagination (page size 10 via `page` search param) and expose previous/next navigation on the listing view.
- [x] Build records listing fetcher for `/records` with page-size 10 pagination powering the metadata-only index route.
- [x] Build single story loader (`/stories/[slug]`) that resolves timeline entries and populated records.
- [x] Add `/records/[slug]` route if standalone record pages are required.
- [x] Implement ISR or revalidation strategy for published updates.
- [x] Note for Next.js 16: dynamic route loaders must `await params`/`searchParams` because they are provided as `Promise` values (story route updated).
- [x] Sort story collections by latest `publishedDate`/`publishedAt` so the home feed surfaces the newest investigations first.
  - [x] Fetch related stories per record to populate record detail “Featured In” cards.

## 4. UI Composition & Theming
- [x] Wire `SiteHeader` with `useEditorialTheme` on new story and record routes.
- [x] Create Story timeline page using existing `TimelineMarker`, `StorySection`, and `SourceCard` components.
- [x] Extend `SourceCard` to support expandable media preview (image, audio player, video embed, PDF viewer).
- [x] Use `react-pdf` for inline document previews while keeping a downloadable fallback link (single-page pager in timelines, full render on record detail page).
- [x] Ensure media types map to appropriate UI primitives (Radix Accordion, custom audio/video players).
- [x] Add “View Source” external link and track `aria` attributes for accessibility.
- [x] Update `next.config.mjs` image `remotePatterns` for Strapi hosts and default timeline/record previews to `unoptimized` images for local media.
- [ ] Validate styling against editorial light/dark themes and update Tailwind tokens if gaps exist.

## 5. Deployment & Handoff
- [ ] Provision hosting for Strapi (Render, Railway, or self-managed) with persistent storage.
- [ ] Configure CI pipeline (GitHub Actions) to deploy Strapi and Next.js on merge.
- [ ] Document environment variables, seeding scripts, and admin credentials for ops.
- [ ] Schedule knowledge transfer session and share the `spec/` reference materials.

## References
- [ ] Strapi docs: https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html
- [ ] Next.js data fetching (App Router): https://nextjs.org/docs/app/building-your-application/data-fetching
- [ ] Radix UI components for accordions/media: https://www.radix-ui.com/docs/primitives/components
