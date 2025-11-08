
  # Revised Interactive Timeline Layout

  This is a code bundle for Revised Interactive Timeline Layout. The original project is available at https://www.figma.com/design/ts6L6xMIgV6WeRtluFtZiL/Revised-Interactive-Timeline-Layout.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Analytics

  PostHog is initialized through a client-side provider to capture page views on route changes.

  Create a `.env.local` file (or update the existing one) with the following variables:

  ```
  NEXT_PUBLIC_POSTHOG_KEY=<your_project_api_key>
  # Optional: use a self-hosted instance
  NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
  # Optional: surface verbose PostHog logs locally
  NEXT_PUBLIC_POSTHOG_DEBUG=true
  # Optional: keep the PostHog toolbar disabled (defaults to true in non-production)
  NEXT_PUBLIC_POSTHOG_DISABLE_TOOLBAR=true
  # Optional: force-enable session recording outside production (default is disabled in dev/test)
  NEXT_PUBLIC_POSTHOG_SESSION_RECORDING=true
  ```

  Restart the dev server after changing these values so the environment variables propagate correctly.

<!-- Deployed via GitHub Actions -->
