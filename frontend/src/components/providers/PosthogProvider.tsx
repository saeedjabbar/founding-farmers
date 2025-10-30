'use client';

import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';
const POSTHOG_DEBUG = process.env.NEXT_PUBLIC_POSTHOG_DEBUG === 'true';
const POSTHOG_DISABLE_TOOLBAR =
  process.env.NEXT_PUBLIC_POSTHOG_DISABLE_TOOLBAR ??
  (process.env.NODE_ENV !== 'production' ? 'true' : 'false');
const POSTHOG_SESSION_RECORDING =
  process.env.NEXT_PUBLIC_POSTHOG_SESSION_RECORDING?.toLowerCase();

let hasInitializedPosthog = false;

export function PosthogProvider({ children }: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const posthogKey = POSTHOG_KEY;
  const posthogHost = POSTHOG_HOST;
  const debugPreference = POSTHOG_DEBUG;
  const disableToolbar =
    POSTHOG_DISABLE_TOOLBAR === 'true' ||
    (POSTHOG_DISABLE_TOOLBAR !== 'false' && process.env.NODE_ENV !== 'production');
  const shouldInit = posthogKey.length > 0;

  useEffect(() => {
    if (!shouldInit || hasInitializedPosthog) {
      return;
    }

    const shouldDisableSessionRecording =
      POSTHOG_SESSION_RECORDING === 'true'
        ? false
        : POSTHOG_SESSION_RECORDING === 'false'
          ? true
          : process.env.NODE_ENV !== 'production';
    const shouldDebug = debugPreference || process.env.NODE_ENV === 'development';

    try {
      hasInitializedPosthog = true;
      posthog.init(posthogKey, {
        api_host: posthogHost,
        capture_pageview: false,
        autocapture: true,
        opt_in_site_apps: !disableToolbar,
        disable_session_recording: shouldDisableSessionRecording,
        enable_recording_console_log: false,
        loaded: (client) => {
          setIsLoaded(true);

          if (shouldDebug) {
            client.debug();
          }
        },
        on_xhr_error: () => {
          // Gracefully handle network hiccups without spamming the console.
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[PostHog] Failed to reach the API host. Analytics events are paused.');
          }
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[PostHog] Initialization failed, analytics disabled.', error);
      }
      hasInitializedPosthog = false;
      return;
    }

    return () => {
      hasInitializedPosthog = false;
      posthog.reset();
      setIsLoaded(false);
    };
  }, [debugPreference, disableToolbar, posthogHost, posthogKey, shouldInit]);

  const currentParams = useMemo(
    () => (searchParams ? searchParams.toString() : ''),
    [searchParams],
  );

  useEffect(() => {
    if (!shouldInit || !isLoaded || !pathname) {
      return;
    }

    posthog.capture('$pageview', {
      $current_url: window.location.href,
    });
  }, [isLoaded, pathname, currentParams, shouldInit]);

  if (!shouldInit) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export default PosthogProvider;
