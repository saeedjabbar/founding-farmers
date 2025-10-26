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
  - [x] `stories` with fields: `title`, `slug`, `blurb`, `author`, `published_at`, `heroMedia?`, `timelineEntries` (repeatable component).
  - [x] `records` with fields: `title`, `slug`, `shortBlurb`, `longDescription`, `mediaAsset (media)`, `mediaType (enum)`, `sourceUrl`, `relatedStories` (m2m).
- [x] Ensure `timelineEntry` component includes `entryDate (date)`, `headline`, `body`, `records (relation -> records)`.
- [ ] Configure default & authenticated roles so public API only exposes published content.
- [ ] Seed or migrate initial content fixtures for QA using the existing Strapi admin.

## 2. Content & Media Operations
- [ ] Import sample stories, timeline entries, and records; ensure shared records can link to multiple stories.
- [ ] Upload representative media assets (image, PDF, audio, video) to Strapi media library.
- [ ] Validate media processing (image thumbnails, PDF preview links, audio/video transcoding if needed).
- [ ] Document editorial workflow for creating new records and associating them with stories.
- [ ] Establish versioning/backups strategy (database export schedule or managed DB).

## 3. Next.js Data Layer Integration
- [ ] Add Strapi base URL and tokens to Next.js runtime config (`env.local` & `next.config`).
- [x] Implement `src/lib/strapi/client.ts` with fetch helpers (REST or GraphQL) including draft/published toggle.
- [x] Create typed DTOs (e.g., `Story`, `TimelineEntry`, `Record`) and mapping utilities from Strapi responses.
- [x] Build story listing fetcher for landing pages (`/stories`).
- [x] Build single story loader (`/stories/[slug]`) that resolves timeline entries and populated records.
- [x] Add `/records/[slug]` route if standalone record pages are required.
- [x] Implement ISR or revalidation strategy for published updates.

## 4. UI Composition & Theming
- [x] Wire `SiteHeader` with `useEditorialTheme` on new story and record routes.
- [x] Create Story timeline page using existing `TimelineMarker`, `StorySection`, and `SourceCard` components.
- [x] Extend `SourceCard` to support expandable media preview (image, audio player, video embed, PDF viewer).
- [x] Ensure media types map to appropriate UI primitives (Radix Accordion, custom audio/video players).
- [x] Add “View Source” external link and track `aria` attributes for accessibility.
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
