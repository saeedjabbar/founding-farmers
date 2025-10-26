'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';
import type { Story } from '@/lib/strapi/types';

interface StoryListPageProps {
  stories: Story[];
}

function formatDisplayDate(date?: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function StoryListPage({ stories }: StoryListPageProps) {
  const { theme, isDark, toggleTheme } = useEditorialTheme();

  return (
    <div className={`min-h-screen theme-bg ${themes[theme].className}`}>
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
        {stories.length === 0 ? (
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
                const isPublished = Boolean(story.publishedAt);
                const hero = story.heroMedia?.url;

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
                          <div className="flex items-center gap-3 text-[11px] md:text-xs uppercase tracking-[0.25em] theme-text-muted">
                            {publishedOn ? (
                              <time dateTime={story.publishedDate ?? story.publishedAt ?? undefined}>{publishedOn}</time>
                            ) : (
                              <span>Draft</span>
                            )}
                            <span className={`tracking-[0.32em] ${isPublished ? 'theme-accent' : 'theme-text-muted'}`}>
                              {isPublished ? 'Published' : 'In Progress'}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-xl uppercase tracking-[0.08em] theme-text-primary leading-snug">
                            {story.title}
                          </h3>
                          <p className="text-sm md:text-base theme-text-secondary leading-relaxed max-w-3xl">
                            {story.blurb}
                          </p>
                          {story.author && (
                            <p className="text-xs theme-text-muted">
                              By <span className="theme-text-primary">{story.author}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
