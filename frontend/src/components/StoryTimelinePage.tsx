'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { TimelineMarker } from '@/components/TimelineMarker';
import { StorySection } from '@/components/StorySection';
import { SourceCard } from '@/components/SourceCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { StrapiRichText } from '@/components/StrapiRichText';
import { formatStrapiDate, getIsoDate } from '@/lib/dates';
import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';
import type { Story } from '@/lib/strapi/types';

interface StoryTimelinePageProps {
  story: Story;
}

function formatMetaDate(date?: string | null): { display: string; iso?: string } | null {
  if (!date) return null;
  const display = formatStrapiDate(date);
  if (!display) {
    return null;
  }

  const iso = getIsoDate(date);

  return {
    display,
    iso: iso ?? undefined,
  };
}

export function StoryTimelinePage({ story }: StoryTimelinePageProps) {
  const { theme, isDark, toggleTheme } = useEditorialTheme();
  const entries = useMemo(
    () =>
      story.timelineEntries.map((entry, index) => ({
        ...entry,
        anchorId: `timeline-entry-${index}-${entry.id}`,
        displayDate: entry.entryDate,
      })),
    [story.timelineEntries]
  );

  const [activeSection, setActiveSection] = useState<string>(entries[0]?.anchorId ?? '');

  useEffect(() => {
    if (entries.length) {
      setActiveSection(entries[0].anchorId);
    }
  }, [entries]);

  useEffect(() => {
    if (!entries.length) return;

    const handleScroll = () => {
      const nearest = entries
        .map((entry) => {
          const element = document.getElementById(entry.anchorId);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          return { id: entry.anchorId, offset: Math.abs(rect.top - 200) };
        })
        .filter(Boolean) as { id: string; offset: number }[];

      if (!nearest.length) return;
      nearest.sort((a, b) => a.offset - b.offset);
      if (nearest[0].id !== activeSection) {
        setActiveSection(nearest[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [entries, activeSection]);

  const metaDate = formatMetaDate(story.publishedDate ?? story.publishedAt ?? undefined);
  const hasAuthor = story.authorName && story.authorName !== 'Unknown';

  const scrollTo = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`min-h-screen theme-bg ${themes[theme].className}`}>
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <article>
        <header className="theme-surface theme-border border-b">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] theme-text-muted">
                <span className="text-[var(--theme-accent)]">[{story.location}]</span>
                {metaDate && (
                  <span className="mx-3 text-[var(--theme-text-muted)]">
                    {metaDate.display}
                  </span>
                )}
              </p>
              <h1 className="theme-text-primary text-xl uppercase tracking-[0.08em] leading-snug max-w-3xl">{story.title}</h1>
            </div>

            {story.heroMedia?.url && (
              <div className="relative w-full aspect-[16/9] md:aspect-[5/2] rounded-lg overflow-hidden border border-[var(--theme-border)]">
                <Image
                  src={story.heroMedia.url}
                  alt={story.heroMedia.alternativeText ?? story.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1280px"
                  priority
                />
              </div>
            )}

            {(story.snippet || story.blurb) && (
              <div className="max-w-3xl space-y-6">
                {story.snippet && (
                  <StrapiRichText
                    content={story.snippet}
                    className="theme-text-secondary text-sm md:text-base"
                    paragraphClassName="leading-relaxed"
                  />
                )}
                {story.blurb && (
                  <StrapiRichText
                    content={story.blurb}
                    className="theme-text-secondary text-sm md:text-base"
                    paragraphClassName="leading-relaxed"
                  />
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 text-sm theme-text-muted md:flex-row md:items-center md:gap-6">
              {hasAuthor && (
                <span>
                  By <span className="theme-text-primary">{story.authorName}</span>
                </span>
              )}
            </div>
          </div>
        </header>

        {entries.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
            <div className="hidden md:grid md:grid-cols-[15%_60%_25%] gap-4 theme-text-muted text-[10px] uppercase tracking-wider mb-8">
              <span>Timeline</span>
              <span>Story Text</span>
              <span>Source Records</span>
            </div>

            <div className="space-y-12 md:space-y-20">
              {entries.map((entry) => (
                <div
                  key={entry.anchorId}
                  className="flex flex-col md:grid md:grid-cols-[15%_60%_25%] gap-4 md:items-start"
                >
                  <div className="md:pt-1">
                    <TimelineMarker
                      date={entry.displayDate}
                      isActive={activeSection === entry.anchorId}
                      onClick={() => scrollTo(entry.anchorId)}
                    />
                  </div>

                  <div>
                    <StorySection id={entry.anchorId} title={entry.headline} body={entry.body} />
                  </div>

                  <div className="space-y-3 mt-4 md:mt-0">
                    {entry.records.length === 0 && (
                      <div className="theme-border theme-surface border rounded-lg shadow-sm px-4 py-3 text-xs theme-text-muted">
                        No source records attached to this milestone yet.
                      </div>
                    )}
                    {entry.records.map((record) => (
                      <SourceCard
                        key={record.id}
                        title={record.title}
                        summary={record.descriptionText ?? ''}
                        content={record.description ?? null}
                        url={record.sourceUrl ?? undefined}
                        mediaType={record.mediaType ?? undefined}
                        mediaAsset={record.mediaAsset}
                        mediaSource={record.mediaSource}
                        videoEmbed={record.videoEmbed ?? null}
                        recordSlug={record.slug}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {story.summary && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 pb-10 md:pb-16">
            <div className="md:grid md:grid-cols-[15%_60%_25%] gap-4 items-start">
              <div className="hidden md:block" />
              <div className="hidden md:block" />
              <div className="w-full">
                <div className="theme-border theme-surface border rounded-lg shadow-sm p-4 space-y-3">
                  <h4 className="text-sm theme-text-primary uppercase tracking-[0.18em]">
                    {story.summary.heading}
                  </h4>
                  {story.summary.body && (
                    <StrapiRichText
                      content={story.summary.body}
                      className="text-xs theme-text-secondary space-y-2 summary-content"
                      paragraphClassName="leading-relaxed"
                      listClassName="pl-4 space-y-1.5"
                    />
                  )}
                  {story.summary.bullets && story.summary.bullets.length > 0 && (
                    <ul className="text-xs theme-text-secondary space-y-1.5">
                      {story.summary.bullets.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-[var(--theme-accent)] mt-[2px]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </article>
      <SiteFooter />
    </div>
  );
}
