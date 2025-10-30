'use client';

import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Mark from 'mark.js';

import { AudioPlayer } from '@/components/AudioPlayer';
import { PdfViewer } from '@/components/PdfViewer';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { StrapiRichText } from '@/components/StrapiRichText';
import VideoEmbedPlayer from '@/components/VideoEmbedPlayer';
import { VideoPlayer } from '@/components/VideoPlayer';
import { hasBlocksContent } from '@/lib/strapi/richText';
import type { SourceRecord, StorySummary } from '@/lib/strapi/types';
import { createSearchRegex, normalizeSearchTerm } from '@/lib/search';
import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface RecordDetailPageProps {
  record: SourceRecord;
  featuredIn?: StorySummary[];
}

type MarkElement = HTMLElementTagNameMap['mark'];
const HIGHLIGHT_CLASS = 'record-search-highlight';
const ACTIVE_HIGHLIGHT_CLASS = 'record-search-highlight-active';

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

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
    case 'document':
      return 'Document';
    default:
      return mediaType;
  }
}

function renderMedia(record: SourceRecord) {
  if (!record.mediaType) return null;

  const isExternalVideo = record.mediaSource === 'externalEmbed' && record.videoEmbed;

  if (record.mediaType === 'video' && isExternalVideo && record.videoEmbed) {
    return <VideoEmbedPlayer embed={record.videoEmbed} />;
  }

  const assetUrl = record.mediaAsset?.url ?? record.sourceUrl ?? undefined;
  if (!assetUrl) return null;
  const downloadUrl = record.mediaAsset?.url ?? record.sourceUrl ?? undefined;
  const mime = record.mediaAsset?.mime?.toLowerCase();
  const isPdfMedia =
    record.mediaType === 'pdf' ||
    mime?.includes('pdf') ||
    assetUrl.toLowerCase().endsWith('.pdf');

  if (record.mediaType === 'image' && record.mediaAsset?.url) {
    return (
      <div className="relative w-full h-80 md:h-[420px] rounded-lg overflow-hidden border border-[var(--theme-border)]">
        <Image
          src={record.mediaAsset.url}
          alt={record.mediaAsset.alternativeText ?? record.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 960px"
          unoptimized
        />
      </div>
    );
  }

  if (record.mediaType === 'audio') {
    return (
      <AudioPlayer
        src={assetUrl}
        type={record.mediaAsset?.mime}
        className="w-full"
        preload="metadata"
        title="Now Playing"
      />
    );
  }

  if (record.mediaType === 'video') {
    if (!record.mediaAsset?.url && record.mediaSource === 'externalEmbed') {
      return null;
    }

    return (
      <VideoPlayer
        src={assetUrl}
        type={record.mediaAsset?.mime ?? undefined}
        title="Video Playback"
        preload="metadata"
      />
    );
  }

  if (isPdfMedia) {
    return (
      <PdfViewer
        fileUrl={assetUrl}
        downloadUrl={downloadUrl}
        title={record.title}
        renderAllPages
      />
    );
  }

  if (record.mediaType === 'document') {
    return (
      <object
        data={assetUrl}
        type={record.mediaAsset?.mime ?? 'application/pdf'}
        className="w-full h-[600px] rounded-md border border-[var(--theme-border)]"
      >
        <p className="text-xs theme-text-secondary">
          PDF preview unavailable.{' '}
          <a href={assetUrl} target="_blank" rel="noopener noreferrer" className="theme-accent underline">
            Download the document
          </a>
          .
        </p>
      </object>
    );
  }

  return null;
}

export function RecordDetailPage({ record, featuredIn = [] }: RecordDetailPageProps) {
  const { theme, isDark, toggleTheme } = useEditorialTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = useMemo(() => normalizeSearchTerm(searchTerm), [searchTerm]);
  const hasSearchQuery = normalizedSearchTerm.length > 0;
  const searchRegex = useMemo(
    () => (hasSearchQuery ? createSearchRegex(normalizedSearchTerm) : null),
    [hasSearchQuery, normalizedSearchTerm]
  );
  const matchRefs = useRef<MarkElement[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const markInstanceRef = useRef<Mark | null>(null);
  const [matchTotal, setMatchTotal] = useState(0);
  const hasMatches = matchTotal > 0;
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const updateActiveHighlight = useCallback((index: number | null) => {
    matchRefs.current.forEach((element, matchIndex) => {
      if (!element) return;
      const isActive = index !== null && matchIndex === index;
      if (isActive) {
        element.setAttribute('data-active', 'true');
        element.classList.add(ACTIVE_HIGHLIGHT_CLASS);
      } else {
        element.removeAttribute('data-active');
        element.classList.remove(ACTIVE_HIGHLIGHT_CLASS);
      }
    });
  }, []);

  const scrollToMatch = useCallback((index: number) => {
    const target = matchRefs.current[index];
    if (!target) {
      return false;
    }

    target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    return true;
  }, []);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    markInstanceRef.current = new Mark(contentRef.current);

    return () => {
      markInstanceRef.current?.unmark();
      markInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    const markInstance = markInstanceRef.current;

    if (!container || !markInstance) {
      return;
    }

    markInstance.unmark({
      done: () => {
        matchRefs.current = [];

        if (!hasSearchQuery || !searchRegex) {
          setMatchTotal(0);
          setActiveMatchIndex(0);
          updateActiveHighlight(null);
          return;
        }

        markInstance.markRegExp(searchRegex, {
          acrossElements: true,
          className: HIGHLIGHT_CLASS,
          separateWordSearch: false,
          each: (element) => {
            const markElement = element as MarkElement;
            const index = matchRefs.current.length;
            markElement.setAttribute('data-match-index', index.toString());
            matchRefs.current.push(markElement);
          },
          done: () => {
            const total = matchRefs.current.length;
            setMatchTotal(total);
            const nextIndex = total > 0 ? 0 : 0;
            setActiveMatchIndex(nextIndex);
            updateActiveHighlight(total > 0 ? 0 : null);
            if (total > 0) {
              requestAnimationFrame(() => {
                scrollToMatch(0);
              });
            }
          },
        });
      },
    });
  }, [hasSearchQuery, searchRegex, record.searchableContent, scrollToMatch, updateActiveHighlight]);

  const goToNextMatch = useCallback(() => {
    if (!hasMatches || matchTotal <= 1) return;
    setActiveMatchIndex((current) => (current + 1) % matchTotal);
  }, [hasMatches, matchTotal]);

  const goToPreviousMatch = useCallback(() => {
    if (!hasMatches || matchTotal <= 1) return;
    setActiveMatchIndex((current) => (current - 1 + matchTotal) % matchTotal);
  }, [hasMatches, matchTotal]);

  useEffect(() => {
    if (!hasMatches) {
      updateActiveHighlight(null);
      return;
    }

    updateActiveHighlight(activeMatchIndex);
    if (!scrollToMatch(activeMatchIndex)) {
      const animationFrame = requestAnimationFrame(() => {
        scrollToMatch(activeMatchIndex);
      });

      return () => cancelAnimationFrame(animationFrame);
    }

    return undefined;
  }, [activeMatchIndex, hasMatches, scrollToMatch, updateActiveHighlight]);

  const metadata = [
    { label: 'Date of Publication', value: formatDate(record.publishDate) },
    { label: 'Date Posted', value: formatDate(record.publishedAt ?? record.createdAt) },
    { label: 'Source', value: getSourceLabel(record.sourceUrl) },
    { label: 'Media Type', value: humanizeMediaType(record.mediaType) },
  ].filter((item) => item.value);

  const mediaHeading =
    record.mediaType === 'image'
      ? 'Document Image'
      : record.mediaType === 'audio'
        ? 'Audio Recording'
        : record.mediaType === 'video'
          ? 'Video Asset'
          : record.mediaType === 'pdf' || record.mediaType === 'document'
            ? 'Document Preview'
            : 'Attached Media';

  const mediaContent = renderMedia(record);
  const hasSearchableContent = hasBlocksContent(record.searchableContent);

  return (
    <div className={`min-h-screen theme-bg ${themes[theme].className}`}>
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-14 space-y-10">
        <section className="theme-border theme-surface border rounded-lg shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] theme-text-muted">Source Record</p>
              <h1 className="theme-text-primary text-xl uppercase tracking-[0.08em] leading-snug">
                {record.title}
              </h1>
              {record.description && (
                <StrapiRichText
                  content={record.description}
                  className="theme-text-secondary text-sm leading-relaxed max-w-2xl space-y-3 record-rich-text"
                />
              )}
            </div>

            {metadata.length > 0 && (
              <dl className="grid grid-cols-1 gap-y-3 text-xs md:text-[13px] uppercase tracking-[0.2em] md:min-w-[240px]">
                {metadata.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <dt className="theme-text-muted">{item.label}</dt>
                    <dd className="theme-text-primary tracking-[0.12em] normal-case">
                      {item.label === 'Source' && record.sourceUrl ? (
                        <Link
                          href={record.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="theme-accent hover:underline tracking-[0.1em]"
                        >
                          {item.value}
                        </Link>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Additional narrative is rendered above; nothing else here */}
        </section>

        <section className="theme-border theme-surface border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--theme-border)]">
            <h2 className="text-sm uppercase tracking-[0.2em] theme-text-muted">{mediaHeading}</h2>
          </div>
          <div
            className={`flex flex-col${
              hasSearchableContent ? ' lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]' : ''
            }`}
          >
            <div
              className={`p-6 md:p-8${
                hasSearchableContent ? ' border-b border-[var(--theme-border)] lg:border-b-0 lg:border-r' : ''
              }`}
            >
              {mediaContent ?? (
                <div className="text-sm theme-text-secondary">
                  Media preview unavailable.
                  {record.sourceUrl && (
                    <>
                      {' '}
                      <a
                        href={record.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="theme-accent hover:underline"
                      >
                        View the original asset
                      </a>
                      .
                    </>
                  )}
                </div>
              )}
            </div>

            {hasSearchableContent && (
              <aside className="border-t border-[var(--theme-border)] lg:border-t-0 lg:border-l">
                <div className="p-6 md:p-8 h-full flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="record-search" className="text-xs uppercase tracking-[0.26em] theme-text-muted">
                      Searchable Content
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="record-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search within content..."
                        className="w-full rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2 text-sm theme-text-primary placeholder:theme-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]"
                        aria-label="Search within searchable content"
                      />
                      {hasSearchQuery && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-[0.3em] theme-text-muted">
                            {hasMatches ? `${activeMatchIndex + 1}/${matchTotal}` : '0/0'}
                          </span>
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={goToPreviousMatch}
                              disabled={!hasMatches || matchTotal <= 1}
                              className={clsx(
                                'flex h-6 w-6 items-center justify-center rounded border border-[var(--theme-border)] bg-[var(--theme-bg)] transition-colors duration-150',
                                'hover:bg-[var(--theme-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]',
                                'disabled:opacity-40 disabled:cursor-not-allowed'
                              )}
                              aria-label="Previous match"
                            >
                              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={goToNextMatch}
                              disabled={!hasMatches || matchTotal <= 1}
                              className={clsx(
                                'flex h-6 w-6 items-center justify-center rounded border border-[var(--theme-border)] bg-[var(--theme-bg)] transition-colors duration-150',
                                'hover:bg-[var(--theme-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]',
                                'disabled:opacity-40 disabled:cursor-not-allowed'
                              )}
                              aria-label="Next match"
                            >
                              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    ref={contentRef}
                    className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg)] px-4 py-4 text-sm theme-text-secondary lg:max-h-[560px] lg:overflow-y-auto"
                  >
                    <StrapiRichText
                      content={record.searchableContent}
                      className="space-y-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap"
                      paragraphClassName="font-mono text-[13px] leading-relaxed whitespace-pre-wrap"
                      listClassName="font-mono text-[13px] leading-relaxed whitespace-pre-wrap"
                    />
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>

        {(record.mediaAsset?.url || record.sourceUrl) && (
          <section className="theme-border theme-surface border rounded-lg shadow-sm p-5 md:p-6 space-y-3 text-sm">
            <h3 className="text-xs uppercase tracking-[0.26em] theme-text-muted">Access</h3>
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
              {record.mediaAsset?.url && (
                <a
                  href={record.mediaAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 theme-text-secondary hover:text-[var(--theme-accent)]"
                >
                  Download media asset
                </a>
              )}
              {record.sourceUrl && (
                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 theme-accent hover:underline"
                >
                  View original source →
                </a>
              )}
            </div>
          </section>
        )}

        {featuredIn.length > 0 && (
          <section className="theme-border theme-surface border rounded-lg shadow-sm p-6 md:p-8 space-y-5">
            <header className="space-y-1 md:space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] theme-text-muted">Featured In</p>
              <h2 className="theme-text-primary text-lg md:text-xl uppercase tracking-[0.08em]">Related Stories</h2>
              <p className="text-sm theme-text-secondary md:max-w-2xl">
                This record surfaces within the stories below. Visit each story to see how it connects to the broader narrative.
              </p>
            </header>

            <div className="grid gap-3 md:gap-4 md:grid-cols-2">
              {featuredIn.map((story) => {
                const publishedOn = formatDate(story.publishedDate ?? story.publishedAt);
                return (
                  <Link
                    key={story.id}
                    href={`/stories/${story.slug}`}
                    className="group theme-surface theme-border border rounded-lg px-4 py-5 flex flex-col gap-2 transition duration-150 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)]"
                  >
                    <div className="text-[11px] uppercase tracking-[0.3em] theme-text-muted flex items-center gap-2">
                      <span className="text-[var(--theme-accent)] tracking-[0.35em]">{story.location}</span>
                      {publishedOn && (
                        <time dateTime={story.publishedDate ?? story.publishedAt ?? undefined}>{publishedOn}</time>
                      )}
                    </div>
                    <h3 className="theme-text-primary text-sm md:text-base uppercase tracking-[0.08em] leading-snug">
                      {story.title}
                    </h3>
                    <span className="text-[11px] uppercase tracking-[0.3em] theme-text-muted">
                      View timeline{' '}
                      <span className="theme-accent group-hover:translate-x-0.5 inline-block transition-transform duration-150">
                        →
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
