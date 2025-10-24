# Repository Guidelines

## Project Structure & Module Organization
- Root `package.json` defines the Vite + React toolchain; `vite.config.ts` handles build settings and aliases.
- Application code lives in `src/`, with `main.tsx` bootstrapping `App.tsx`.
- Reusable UI lives in `src/components/` (`ui/` for primitives, feature components at the top level); shared theme logic sits in `src/lib/`.
- Global design tokens and Tailwind layers are declared in `src/index.css`; additional style helpers reside in `src/styles/`.
- Narrative copy and supporting docs are grouped under `src/guidelines/`. Static shell markup is served from the project root `index.html`.

## Build, Test, and Development Commands
- Install once with:
  ```sh
  npm install
  ```
- Start the hot-reloading dev server on http://localhost:5173:
  ```sh
  npm run dev
  ```
- Produce an optimized bundle in `dist/` (run before publishing or opening a PR):
  ```sh
  npm run build
  ```

## Coding Style & Naming Conventions
- TypeScript + React functional components only; default to 2-space indentation.
- Use `PascalCase` for components (`TimelineMarker.tsx`), `camelCase` for hooks/utilities, and keep file names aligned with exported symbols.
- Prefer composable props over context where possible; colocate component-specific styles next to the component unless they belong in shared utilities.
- Tailwind v4 utilities and CSS custom properties drive styling—extend tokens in `src/index.css` rather than scattering hard-coded colors.
- Keep imports sorted by origin (React, third-party, local). Run an editor formatter before committing (Prettier-compatible settings assumed).

## Testing Guidelines
- Automated tests are not yet configured; introduce Vitest + React Testing Library with specs under `src/__tests__/` when adding coverage.
- For manual QA, verify new components in light/dark themes using the `ThemeSwitcher` and confirm timeline scrolling behavior in Chromium and Safari.
- Treat story data in `App.tsx` as fixture content—extract to a data module when adding tests to simplify mocking.

## Commit & Pull Request Guidelines
- Write imperative present-tense commit subjects under 50 characters (e.g., `Add compact marker variant`); include a short body when context is non-obvious.
- Scope each PR to a single feature or bug; describe the change, impacted views, and manual verification steps. Attach screenshots or recordings for UI updates.
- Link relevant issues in the PR description and ensure `npm run build` completes locally before requesting review.
