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

## Routing & Pages
- [ ] Update `client/src/app/layout.tsx` to load shared data if global navigation requires story summaries.
- [x] Implement `/stories/page.tsx` listing story previews (title, blurb, published date, author, hero image).
  - [x] Paginate listings in 10-story pages using the `page` search param with previous/next controls.
- [x] Implement `/stories/[slug]/page.tsx` rendering the timeline using `TimelineMarker`, `StorySection`, and `SourceCard`.
- [x] Implement optional `/records/[slug]/page.tsx` for deep links to individual records.
- [x] Wire `SiteHeader` component to all new routes and pass `useEditorialTheme` data.
- [x] When adding new dynamic routes in Next.js 16, remember `params`/`searchParams` arrive as `Promise` values and must be awaited before use (adjusted on `/stories/[slug]`).

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

## Theming & UX
- [ ] Validate timeline and source cards across `editorialRedLight` and `editorialRedDark`.
- [ ] Align typography and spacing with existing tokens (`theme-*` classes).
- [ ] Confirm motion/animation matches existing editorial storytelling patterns.

## Validation & Deployment
- [ ] Document steps to restart `/server` Strapi instance so schema changes sync to Postgres.
- [ ] Capture manual QA checklist for story timeline flows post-integration.
