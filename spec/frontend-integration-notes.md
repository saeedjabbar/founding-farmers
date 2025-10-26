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

## Routing & Pages
- [ ] Update `client/src/app/layout.tsx` to load shared data if global navigation requires story summaries.
- [x] Implement `/stories/page.tsx` listing story previews (title, blurb, published date, author, hero image).
- [x] Implement `/stories/[slug]/page.tsx` rendering the timeline using `TimelineMarker`, `StorySection`, and `SourceCard`.
- [x] Implement optional `/records/[slug]/page.tsx` for deep links to individual records.
- [x] Wire `SiteHeader` component to all new routes and pass `useEditorialTheme` data.

## Components & Rendering
- [x] Ensure `SourceCard` accepts expanded data: `longDescription`, `mediaAsset`, `mediaType`, `sourceUrl`.
- [x] Extend media rendering utilities to handle:
  - [x] Images via `<Image>`.
  - [x] Audio via `<audio controls>`.
  - [x] Video via `<video controls>`.
  - [x] PDF/doc via link + embed fallback.
- [x] Ensure accordion/dropdown interaction reveals media preview and long description.
- [x] Provide accessible labels and `aria-controls` for toggles and media players.

## Theming & UX
- [ ] Validate timeline and source cards across `editorialRedLight` and `editorialRedDark`.
- [ ] Align typography and spacing with existing tokens (`theme-*` classes).
- [ ] Confirm motion/animation matches existing editorial storytelling patterns.

## Validation & Deployment
- [ ] Document steps to restart `/server` Strapi instance so schema changes sync to Postgres.
- [ ] Capture manual QA checklist for story timeline flows post-integration.
