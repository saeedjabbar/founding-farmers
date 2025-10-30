import type { Metadata } from 'next';
import { Suspense } from 'react';
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
      </head>
      <body className="antialiased">
        <Suspense>
          <PosthogProvider>{children}</PosthogProvider>
        </Suspense>
      </body>
    </html>
  );
}
