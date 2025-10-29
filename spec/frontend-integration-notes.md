# Frontend Integration Notes

## Data Fetching
- [x] Add `STRAPI_BASE_URL` and `STRAPI_API_TOKEN` placeholders in `client/.env.local` and document requirements.
- [x] Implement `client/src/lib/strapi/client.ts` exposing `fetchFromStrapi<T>()` with automatic draft/published param support.
- [x] Create strongly typed mappers in `client/src/lib/strapi/mappers.ts` for:
  - [x] `StoryDocument` → `Story` (includes `timelineEntries` with populated `records`).
  - [x] `RecordDocument` → `Record`.
- [x] Provide shared TypeScript interfaces in `client/src/lib/strapi/types.ts` mirroring Strapi schema.
- [x] Expose helper `getStories()` and `getStoryBySlug(slug)` using REST `populate` queries:
  ```ts
  await fetchFromStrapi<StrapiStoryResponse>(
    '/api/stories',
    { populate: { timelineEntries: { populate: ['records', 'records.mediaAsset'] }, heroMedia: true } }
  );
  ```
- [x] Add `getRecordBySlug(slug)` query to support standalone record route (if needed).
- [x] Ensure home story listing sorts newest-first via `publishedDate` with `publishedAt` fallback to handle missing editorial dates.
- [x] Add `getStoriesFeaturingRecord(recordSlug)` to provide lightweight story summaries for the record detail "Featured In" cards.
- [x] Add `getStandardsPage()` query to resolve the editorial standards single-type (returns title + Blocks body, no summary).
- [x] Add `getPrivacyPolicyPage()` query to resolve the privacy policy single-type.
- [x] Populate the Strapi `shared.seo` component (lowercase `seo` attribute) for stories, records, and single-types, mapping it to strongly typed `SeoMetadata` via `mapSeoComponent()` and exposing helpers that prefer Strapi-provided meta fields.
- [x] Surface SEO helpers in `src/lib/seo.ts` (`getSiteBaseUrl`, `createPageMetadata`, `serializeStructuredData`) and ensure all detail pages call them before rendering.
- [x] Add `resolveStrapiBaseUrl()` to `client/src/lib/strapi/client.ts` so route handlers can proxy Strapi endpoints (sitemap, XSL assets) without duplicating env logic.

## Routing & Pages
- [ ] Update `client/src/app/layout.tsx` to load shared data if global navigation requires story summaries.
- [x] Implement `/stories/page.tsx` listing story previews (title, blurb, published date, author, hero image).
  - [x] Paginate listings in 10-story pages using the `page` search param with previous/next controls.
- [x] Implement `/stories/[slug]/page.tsx` rendering the timeline using `TimelineMarker`, `StorySection`, and `SourceCard`.
- [x] Implement optional `/records/[slug]/page.tsx` for deep links to individual records.
- [x] Implement `/records/page.tsx` to list source records as metadata cards (no thumbnails), paginated in 10-item pages via the `page` search param.
- [x] Implement `/standards/page.tsx` to render the editorial standards rich text using `StrapiRichText` with shared theming.
- [x] Implement `/privacy-policy/page.tsx` mirroring the standards layout (not exposed in nav yet).
- [x] Wire `SiteHeader` component to all new routes and pass `useEditorialTheme` data.
- [x] When adding new dynamic routes in Next.js 16, remember `params`/`searchParams` arrive as `Promise` values and must be awaited before use (adjusted on `/stories/[slug]`).
- [x] Provide per-route `generateMetadata` implementations that call `createPageMetadata()` using Strapi SEO data and render optional JSON-LD from `serializeStructuredData()`.
- [x] Add `/sitemap.xml` route to proxy the Webtools sitemap output from Strapi and `/xsl/[...path]` to expose the associated XSL/CSS/JS assets for crawler styling.

## Analytics & Telemetry
- [x] Add PostHog support via `src/components/providers/PosthogProvider.tsx` and wrap the root layout to capture client-side navigation events.
- [x] Document required env vars (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_DEBUG`, `NEXT_PUBLIC_POSTHOG_DISABLE_TOOLBAR`, `NEXT_PUBLIC_POSTHOG_SESSION_RECORDING`) in the client README.
- [x] Default the PostHog toolbar to disabled outside production while allowing opt-in via env flag.
- [x] Allow session recording in development when `NEXT_PUBLIC_POSTHOG_SESSION_RECORDING=true`.

## Components & Rendering
- [x] Ensure `SourceCard` accepts expanded data: `longDescription`, `mediaAsset`, `mediaType`, `sourceUrl` (long narrative content comes through as Blocks JSON, never Markdown).
- [x] Centralize Blocks rendering via `StrapiRichText` so all rich text fields consume the JSON Blocks schema.
- [x] Extend media rendering utilities to handle:
  - [x] Images via `<Image>` (timeline cards use `unoptimized` to avoid local Strapi proxy issues; update `next.config.mjs` if the CDN host changes).
  - [x] Audio via `<audio controls>`.
  - [x] Video via `<video controls>`.
  - [x] PDF/doc via `react-pdf` preview with download fallback (source cards default to single-page viewer with pager; record detail pages render all pages).
- [x] Ensure accordion/dropdown interaction reveals media preview and long description.
- [x] Provide accessible labels and `aria` attributes for toggles and media players.
- [x] Add optional story summary card rendering at timeline bottom. Summary pulls from Strapi `summaryEnabled` + `summaryCard` (enter bullets as newline-separated text; body authored with Blocks editor, frontend renders via `StrapiRichText`).
- [x] Style `/records/[slug]` detail page to present top summary/metadata card plus media panel; media renders according to type (image, audio, video, PDF) with accent-styled summary actions.
  - [x] Surface related story cards at the bottom of record detail pages linking to their timelines.
- [x] Update metadata fallback logic so pages gracefully default to site-wide titles/descriptions when Strapi SEO data is absent. Configure canonical URLs through `NEXT_PUBLIC_SITE_URL` (with `SITE_URL`/`NEXT_PUBLIC_APP_URL` fallback).

## Theming & UX
- [ ] Validate timeline and source cards across `editorialRedLight` and `editorialRedDark`.
- [ ] Align typography and spacing with existing tokens (`theme-*` classes).
- [ ] Confirm motion/animation matches existing editorial storytelling patterns.

## Validation & Deployment
- [ ] Document steps to restart `/server` Strapi instance so schema changes sync to Postgres.
- [ ] Capture manual QA checklist for story timeline flows post-integration.
- [ ] Add SEO validation checklist (meta title/description, canonical URL, structured data) for key routes post-publish.
