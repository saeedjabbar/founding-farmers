# Agent Guidelines

## Framework & Tooling
- The project runs on **Next.js 16 (App Router)** with TypeScript. Pages live under `src/app/**/page.tsx` and share layout/state through `src/app/layout.tsx`.
- Next.js 16 now delivers route props as `Promise` objects; server components should `await params`/`searchParams` before use.
- Tailwind CSS (configured in `tailwind.config.js`) provides utility-first styling; prefer using existing custom properties (`theme-*` classes) instead of hard-coded colors.
- Motion/animation helpers come from `motion` and UI primitives from Radix. Icons use `lucide-react`. PDF previews rely on `react-pdf`.
- Record-detail search highlighting uses `mark.js`; keep the dependency updated alongside the DOM highlight classes defined in `src/styles/globals.css`.

## Project Structure
- `src/app/` – route segments (`page.tsx`), layout, and Next metadata (including `icon.png`).
- `src/app/sitemap.xml/route.ts` proxies the Strapi-generated sitemap XML so crawlers hit the Next.js domain.
- `src/app/xsl/[...path]/route.ts` exposes the Webtools XSL, JS, and CSS helpers used by the sitemap index styling.
- `src/components/` – reusable components; primitives live in `components/ui/`. Notable shared pieces:
  - `SiteHeader.tsx` – renders masthead/nav plus the light/dark toggle.
  - `SiteFooter.tsx` – global footer with the privacy-policy link, ©2025 credit, and outbound X profile badge.
  - `TimelineMarker`, `StorySection`, `SourceCard` – story timeline UI.
  - `StoryTimelinePage` also renders an optional summary card fed by Strapi.
- `RecordDetailPage` presents source record summaries with metadata + media viewer and surfaces related story cards, driven by Strapi `records` data (rich-text `description`, media asset, source URL).
- Record detail pages also render an optional **Searchable Content** sidebar. Strapi exposes this as a Blocks (`searchableContent`) field; populate it with rich text to show the monospaced transcript-style panel beside the media viewer. The sidebar includes a client-side search input that highlights matches with `mark.js` and uses the `record-search-highlight(_active)` classes for consistent styling plus next/previous navigation.
  - `StoryListPage` sorts stories descending by publish timestamp using `publishedDate` with a `publishedAt` fallback and paginates results in 10-item pages with previous/next controls driven by the `page` search param.
  - `RecordListPage` lists records with metadata-only cards (no thumbnails), sorted by publish timestamp, and paginated in 10-item pages keyed off the `page` search param.
  - `PdfViewer` handles inline PDFs. Source cards load a single page with in-card navigation; record detail pages request the full document render.
  - `StandardsPage` renders the editorial rules single-type with the shared theme + header.
  - `PrivacyPolicyPage` mirrors the standards layout for the privacy policy single-type (route: `/privacy-policy`, not linked in nav).
- `src/lib/` – shared logic. `useEditorialTheme.ts` locks the experience to the Editorial Red palette and syncs with system preferences plus the header toggle.
  - Strapi queries now include `getStoriesFeaturingRecord(recordSlug)` for "Featured In" summaries, `getStandardsPage()` for the `/standards` single page, and `getPrivacyPolicyPage()` for `/privacy-policy`, all of which populate the `shared.seo` component.
  - `src/lib/seo.ts` provides `getSiteBaseUrl()`, `createPageMetadata()`, and `serializeStructuredData()` helpers. Use these from route files to map Strapi SEO fields into Next.js metadata and JSON-LD `<script>` tags.
  - `src/lib/strapi/client.ts` exposes `resolveStrapiBaseUrl()` for sitemap/XSL proxies in addition to `strapiFetch`.
  - `src/lib/search.ts` centralizes search-term normalization and regex helpers shared by the record searchable-content panel and future in-app search surfaces.
- `src/styles/` and `src/app/globals.css` – global layers, tokens, and theme class definitions.
- Documentation and supporting copy live under `src/guidelines/`.

## Theming Expectations
- Only `editorialRedLight` and `editorialRedDark` themes are supported. The hook `useEditorialTheme` must stay the single source of truth; components receive `theme`, `isDark`, and `toggleTheme` props where needed.
- `SiteHeader` already accepts `isDark`/`onToggleTheme`; reuse it on any new page to keep the toggle consistent.

## Development Commands
- Install dependencies: `npm install`
- Start dev server (http://localhost:3000): `npm run dev`
- Produce a production build: `npm run build`
- Lint for formatting/import order issues: `npm run lint`

## Analytics & Telemetry
- PostHog loads through the client-only provider at `src/components/providers/PosthogProvider.tsx`; it wraps the App Router in `src/app/layout.tsx`.
- Configure analytics with `NEXT_PUBLIC_POSTHOG_KEY` (plus optional `NEXT_PUBLIC_POSTHOG_HOST`). Debug logging toggles via `NEXT_PUBLIC_POSTHOG_DEBUG=true`.
- The provider disables the PostHog toolbar by default in non-production builds; override with `NEXT_PUBLIC_POSTHOG_DISABLE_TOOLBAR=false` if needed.
- Session recording is opt-out locally; set `NEXT_PUBLIC_POSTHOG_SESSION_RECORDING=true` to test FullSession Replay in development.

## Style & Authoring Conventions
- TypeScript + React function components only; default to 2-space indentation.
- PascalCase component filenames, camelCase hooks/utilities, and align file names with their default export.
- Keep imports grouped (React → third-party → local). Use Tailwind classes; prefer extracting repeated patterns to components or utilities.
- When tagging forms or interactive elements, ensure proper labels and `aria-*` attributes for accessibility.
- Treat Strapi content as the single source of truth: story authors display via the hidden `authorName` field (automatically populated by lifecycle hooks) and the optional summary card is controlled by `summaryEnabled` plus `summaryCard` (heading, rich paragraph, newline-separated bullets).
- Editorial standards live in the Strapi single-type `standard` (title + Blocks body). The server bootstrap seeds default content if it's empty.
- Privacy policy copy lives in the Strapi single-type `privacy-policy` (title + Blocks body) and is auto-seeded during bootstrap if missing.
- All Strapi rich narrative fields must use the Blocks editor (JSON) going forward; do not introduce Markdown-based rich text. Records now include a `searchableContent` Blocks field to capture optional transcript-style content for the sidebar.
- Strapi media lives under `http(s)://<host>:1337/uploads/*`. Inline previews currently pass `unoptimized` to `next/image`; update `next.config.mjs` if the Strapi URL changes in higher environments.
- Strapi SEO plugin (`@strapi/plugin-seo`) seeds a `shared.seo` component with meta fields. All content-types now expose a `seo` component (lowercase) on the REST API. Queries must populate `seo` and pass the result through `createPageMetadata()` so `<head>` tags reflect Strapi data.
- Strapi Webtools (`strapi-plugin-webtools`) is enabled; bootstrap seeds URL alias patterns for stories, records, standards, and privacy policy. Generated aliases live in `plugin::webtools.url-alias`.
- The Webtools sitemap add-on stores XML snapshots in Strapi (`plugin::webtools-addon-sitemap.sitemap`) and is auto-generated after content writes; defaults are seeded from bootstrap but editable via the admin UI.
- Frontend metadata should prefer Strapi values but fall back to existing copy. When structured data exists, emit it via `serializeStructuredData()` inside a JSON-LD `<script type="application/ld+json">`.
- Configure canonical URLs by setting `NEXT_PUBLIC_SITE_URL` (or fallback `SITE_URL`, `NEXT_PUBLIC_APP_URL`, etc.); `getSiteBaseUrl()` resolves these to feed Next metadata `metadataBase`.
- Strapi expects environment flags captured in `.env(.example)` such as `WEBTOOLS_WEBSITE_URL`, `WEBTOOLS_UNIQUE_PER_LOCALE`, `SITEMAP_CRON`, `SITEMAP_MAX_LINKS`, `SITEMAP_AUTO_GENERATE`, and `SITEMAP_XSL_ENABLED`; keep these aligned across environments so sitemap URLs stay correct.

## Testing & QA
- Automated tests are not yet configured. If introducing tests, colocate them under `src/__tests__/` using Vitest + React Testing Library.
- Manual QA checklist: confirm layout in both editorial light/dark modes via the header toggle and system preference, validate timeline scrolling behavior in Chromium and Safari.

## Git & Collaboration
- Write imperative commit subjects ≤50 characters (e.g., `Add submit form shell`).
- Scope PRs to single features/bugs, document affected routes, and list manual verification steps (include screenshots for UI changes).
- Always ensure `npm run build` succeeds before requesting review.
