'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { StrapiRichText } from '@/components/StrapiRichText';
import { formatStrapiDate } from '@/lib/dates';
import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';
import type { Story } from '@/lib/strapi/types';

interface StoryListPageProps {
  stories: Story[];
  currentPage: number;
  pageCount: number;
  basePath: string;
}

const formatDisplayDate = (date?: string | null) => formatStrapiDate(date);

function buildPageHref(basePath: string, page: number): string {
  if (page <= 1) {
    return basePath;
  }
  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}page=${page}`;
}

export function StoryListPage({
  stories,
  currentPage,
  pageCount,
  basePath,
}: StoryListPageProps) {
  const { theme, isDark, toggleTheme } = useEditorialTheme();
  const normalizedBasePath = basePath === '/' ? '/' : basePath.replace(/\/$/, '');
  const hasStories = stories.length > 0;
  const safeCurrentPage = currentPage > 0 ? currentPage : 1;
  const hasPrevious = safeCurrentPage > 1;
  const hasNext = safeCurrentPage < pageCount;
  const paginationLabel = `Page ${safeCurrentPage.toLocaleString('en-US')} of ${pageCount.toLocaleString('en-US')}`;
  const actionBaseClasses =
    'inline-flex items-center justify-center rounded-full px-4 py-2 uppercase text-[11px] tracking-[0.25em] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)]';
  const previousClasses = `${actionBaseClasses} theme-surface theme-border border text-[var(--theme-accent)] hover:text-[var(--theme-accent-hover)]`;
  const nextClasses = `${actionBaseClasses} bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-hover)]`;
  const disabledClasses = 'pointer-events-none opacity-50 cursor-not-allowed theme-text-muted';

  return (
    <div className={`min-h-screen theme-bg ${themes[theme].className}`}>
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
        {!hasStories ? (
          <section className="theme-surface theme-border border rounded-lg shadow-sm p-6 text-center">
            <h2 className="theme-text-primary text-lg mb-3">Stories coming soon</h2>
            <p className="theme-text-secondary text-sm max-w-xl mx-auto">
              We&apos;re preparing the first investigative timeline. Check back shortly for newly published stories.
            </p>
          </section>
        ) : (
          <section>
            <div>
              {stories.map((story) => {
                const publishedOn = formatDisplayDate(story.publishedDate ?? story.publishedAt);
                const hero = story.heroMedia?.url;
                const snippetContent = story.snippet ?? story.blurb;

                return (
                  <article key={story.id} className="py-6 md:py-8 border-b border-dashed border-[var(--theme-border)] last:border-none">
                    <Link
                      href={`/stories/${story.slug}`}
                      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)] transition-colors duration-150 hover:opacity-90"
                    >
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                        {hero && (
                          <div className="relative w-full md:w-48 h-48 md:h-32 flex-shrink-0 overflow-hidden rounded-md border border-[var(--theme-border)]">
                            <Image
                              src={hero}
                              alt={story.heroMedia?.alternativeText ?? `${story.title} hero image`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 12rem"
                              priority={false}
                            />
                          </div>
                        )}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3 text-[11px] md:text-xs uppercase tracking-[0.25em] theme-text-muted">
                            <span className="text-[var(--theme-accent)] tracking-[0.3em]">
                              [{story.location}]
                            </span>
                            {publishedOn && (
                              <time dateTime={story.publishedDate ?? story.publishedAt ?? undefined}>{publishedOn}</time>
                            )}
                          </div>
                          <h3 className="text-lg md:text-xl uppercase tracking-[0.08em] theme-text-primary leading-snug max-w-3xl">
                            {story.title}
                          </h3>
                          {snippetContent && (
                            <StrapiRichText
                              content={snippetContent}
                              className="text-sm md:text-base theme-text-secondary max-w-3xl"
                              paragraphClassName="leading-relaxed"
                            />
                          )}
                          {story.authorName && story.authorName !== 'Unknown' && (
                            <p className="text-xs theme-text-muted">
                              By <span className="theme-text-primary">{story.authorName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
            {pageCount > 1 && (
              <nav
                className="mt-10 flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-6"
                aria-label="Stories pagination"
              >
                <p className="text-[11px] uppercase tracking-[0.3em] theme-text-muted">{paginationLabel}</p>
                <div className="flex items-center gap-3">
                  {hasPrevious ? (
                    <Link href={buildPageHref(normalizedBasePath, safeCurrentPage - 1)} className={previousClasses}>
                      Previous
                    </Link>
                  ) : (
                    <span className={`${previousClasses} ${disabledClasses}`} aria-disabled="true">
                      Previous
                    </span>
                  )}
                  {hasNext ? (
                    <Link href={buildPageHref(normalizedBasePath, safeCurrentPage + 1)} className={nextClasses}>
                      Next
                    </Link>
                  ) : (
                    <span className={`${nextClasses} ${disabledClasses}`} aria-disabled="true">
                      Next
                    </span>
                  )}
                </div>
              </nav>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
