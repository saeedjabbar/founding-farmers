'use client';

import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { StrapiRichText } from '@/components/StrapiRichText';
import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';
import type { StandardsPage as StandardsPageContent } from '@/lib/strapi/types';

interface StandardsPageProps {
  page: StandardsPageContent;
}

export function StandardsPage({ page }: StandardsPageProps) {
  const { theme, isDark, toggleTheme } = useEditorialTheme();
  const hasContent = page.body.length > 0;

  return (
    <div className={`min-h-screen theme-bg ${themes[theme].className}`}>
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <article className="space-y-8">
          <header className="space-y-3">
            <h1 className="text-lg md:text-xl font-semibold theme-text-primary leading-tight">
              {page.title}
            </h1>
          </header>

          {hasContent ? (
            <StrapiRichText
              content={page.body}
              className="space-y-6 text-sm md:text-base theme-text-secondary"
              paragraphClassName="text-sm md:text-base theme-text-secondary"
              listClassName="text-sm md:text-base theme-text-secondary"
            />
          ) : (
            <p className="text-sm md:text-base theme-text-secondary">
              Our editorial standards will be published soon.
            </p>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
