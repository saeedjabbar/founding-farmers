'use client';

import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { formatStrapiDate } from '@/lib/dates';
import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';
import type { SourceRecord } from '@/lib/strapi/types';

interface RecordListPageProps {
  records: SourceRecord[];
  currentPage: number;
  pageCount: number;
  basePath: string;
}

const formatDisplayDate = (value?: string | null) => formatStrapiDate(value);

function getSourceLabel(url?: string | null): string | null {
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function humanizeMediaType(mediaType?: SourceRecord['mediaType']): string | null {
  if (!mediaType) return null;
  switch (mediaType) {
    case 'image':
      return 'Image';
    case 'audio':
      return 'Audio';
    case 'video':
      return 'Video';
    case 'pdf':
      return 'Document';
    case 'document':
      return 'Document';
    default:
      return mediaType;
  }
}

function buildPageHref(basePath: string, page: number): string {
  if (page <= 1) {
    return basePath;
  }
  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}page=${page}`;
}

function truncateText(value: string, limit = 200): string {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trimEnd()}…`;
}

export function RecordListPage({ records, currentPage, pageCount, basePath }: RecordListPageProps) {
  const { theme, isDark, toggleTheme } = useEditorialTheme();
  const normalizedBasePath = basePath === '/' ? '/' : basePath.replace(/\/$/, '');
  const hasRecords = records.length > 0;
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
    <div className={`min-h-screen theme-bg ${themes[theme].className}`} suppressHydrationWarning>
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
        {!hasRecords ? (
          <section className="theme-surface theme-border border rounded-lg shadow-sm p-6 text-center">
            <h2 className="theme-text-primary text-lg mb-3 uppercase tracking-[0.08em]">Records coming soon</h2>
            <p className="theme-text-secondary text-sm max-w-xl mx-auto">
              We&apos;re preparing archival materials and source documents. Check back for the latest primary records tied
              to our investigations.
            </p>
          </section>
        ) : (
          <section>
            <div>
              {records.map((record) => {
                const publishDate =
                  formatDisplayDate(record.publishDate) ??
                  formatDisplayDate(record.publishedAt ?? record.createdAt);
                const mediaLabel = humanizeMediaType(record.mediaType);
                const sourceLabel = getSourceLabel(record.sourceUrl);
                const summary = record.descriptionText ? truncateText(record.descriptionText, 240) : null;

                return (
                  <article key={record.id} className="py-6 md:py-8 border-b border-dashed border-[var(--theme-border)] last:border-none">
                    <Link
                      href={`/records/${record.slug}`}
                      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)] transition-colors duration-150 hover:opacity-90"
                    >
                      <div className="flex flex-col gap-6 md:gap-8">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3 text-[11px] md:text-xs uppercase tracking-[0.25em] theme-text-muted">
                            {mediaLabel && (
                              <span className="text-[var(--theme-accent)] tracking-[0.3em]">
                                [{mediaLabel}]
                              </span>
                            )}
                            {publishDate && (
                              <time dateTime={record.publishDate ?? record.publishedAt ?? record.createdAt ?? undefined}>
                                {publishDate}
                              </time>
                            )}
                            {sourceLabel && <span>{sourceLabel}</span>}
                          </div>
                          <h3 className="text-lg md:text-xl uppercase tracking-[0.08em] theme-text-primary leading-snug">
                            {record.title}
                          </h3>
                          {summary && (
                            <p className="text-sm md:text-base theme-text-secondary leading-relaxed max-w-3xl">
                              {summary}
                            </p>
                          )}
                          <p className="text-xs theme-text-muted">
                            View full record&nbsp;
                            <span className="theme-accent">→</span>
                          </p>
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
                aria-label="Records pagination"
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
