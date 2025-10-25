# Agent Guidelines

## Framework & Tooling
- The project runs on **Next.js 14 (App Router)** with TypeScript. Pages live under `src/app/**/page.tsx` and share layout/state through `src/app/layout.tsx`.
- Tailwind CSS (configured in `tailwind.config.js`) provides utility-first styling; prefer using existing custom properties (`theme-*` classes) instead of hard-coded colors.
- Motion/animation helpers come from `motion` and UI primitives from Radix. Icons use `lucide-react`.

## Project Structure
- `src/app/` – route segments (`page.tsx`), layout, and Next metadata (including `icon.png`).
- `src/components/` – reusable components; primitives live in `components/ui/`. Notable shared pieces:
  - `SiteHeader.tsx` – renders masthead/nav plus the light/dark toggle.
  - `TimelineMarker`, `StorySection`, `SourceCard` – story timeline UI.
- `src/lib/` – shared logic. `useEditorialTheme.ts` locks the experience to the Editorial Red palette and syncs with system preferences plus the header toggle.
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

## Style & Authoring Conventions
- TypeScript + React function components only; default to 2-space indentation.
- PascalCase component filenames, camelCase hooks/utilities, and align file names with their default export.
- Keep imports grouped (React → third-party → local). Use Tailwind classes; prefer extracting repeated patterns to components or utilities.
- When tagging forms or interactive elements, ensure proper labels and `aria-*` attributes for accessibility.

## Testing & QA
- Automated tests are not yet configured. If introducing tests, colocate them under `src/__tests__/` using Vitest + React Testing Library.
- Manual QA checklist: confirm layout in both editorial light/dark modes via the header toggle and system preference, validate timeline scrolling behavior in Chromium and Safari.

## Git & Collaboration
- Write imperative commit subjects ≤50 characters (e.g., `Add submit form shell`).
- Scope PRs to single features/bugs, document affected routes, and list manual verification steps (include screenshots for UI changes).
- Always ensure `npm run build` succeeds before requesting review.
