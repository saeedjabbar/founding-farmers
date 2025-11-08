import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getSiteBaseUrl } from '@/lib/seo';
import PosthogProvider from '@/components/providers/PosthogProvider';
import './globals.css';

const metadataBase = getSiteBaseUrl();

export const metadata: Metadata = {
  title: 'The Chronicle Timeline',
  description: 'Investigative timeline experience with dynamic themes and storytelling.',
  ...(metadataBase ? { metadataBase } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('editorial-theme-preference');
                  var theme = stored === 'editorialRedDark' ? 'editorialRedDark' : 'editorialRedLight';
                  
                  if (!stored && window.matchMedia) {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = prefersDark ? 'editorialRedDark' : 'editorialRedLight';
                  }
                  
                  var themeClass = theme === 'editorialRedDark' ? 'theme-editorial-red-dark' : 'theme-editorial-red-light';
                  document.documentElement.classList.add(themeClass);
                } catch (e) {
                  // Fallback to light theme if localStorage is unavailable
                  document.documentElement.classList.add('theme-editorial-red-light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <Suspense>
          <PosthogProvider>{children}</PosthogProvider>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
