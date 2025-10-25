'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { navItems } from '@/lib/navigation';
import type { Theme } from '@/lib/themes';
import { themes } from '@/lib/themes';

type StoryListing = {
  id: string;
  title: string;
  date: string;
  location: string;
  summary: string;
  href?: string;
  status?: 'comingSoon' | 'published';
  beats?: string[];
};

const storyListings: StoryListing[] = [
  {
    id: 'agricultural-zones',
    title: 'Land Acquisition Patterns in Agricultural Zones',
    date: '2025.10.15',
    location: 'Marlborough',
    summary: 'Documents obtained through public records requests indicate coordinated purchasing of farmland parcels by a network of holding companies...',
    status: 'comingSoon',
    beats: ['Land Use', 'Corporate Filings'],
  },
  {
    id: 'water-rights',
    title: 'Water Rights Transfers and Municipal Agreements',
    date: '2025.09.28',
    location: 'Hudson Valley',
    summary: 'Analysis of water management records shows a pattern of rights consolidation across tributary systems with overlapping municipal authorities...',
    status: 'comingSoon',
    beats: ['Infrastructure', 'Policy Analysis'],
  },
  {
    id: 'land-grants',
    title: 'Historical Land Grants and Current Ownership',
    date: '2025.09.12',
    location: 'Berkshires',
    summary: 'Previously sealed historical documents detail original colonial land distributions and their modern implications for contested properties...',
    status: 'comingSoon',
    beats: ['Archives', 'Property Records'],
  },
  {
    id: 'the-letter',
    title: 'The Letter That Changed Everything',
    date: '2025.06.05',
    location: 'Crescent City',
    summary: 'A plain envelope triggered a months-long investigation traced through correspondence, municipal archives, and oral histories. Follow the full timeline of findings.',
    href: '/story',
    status: 'published',
    beats: ['Primary Source', 'Oral History'],
  },
];

export default function HomePage() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('archiveLight');
  const pathname = usePathname();
  const isStoriesPath = pathname === '/' || pathname.startsWith('/story');

  return (
    <div className={`min-h-screen theme-bg ${themes[currentTheme].className}`}>
      <header className="theme-surface theme-border border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="theme-text-primary text-lg md:text-xl font-semibold leading-tight">
                  The Founding Farmers
                </h1>
                <p className="text-xs theme-text-muted mt-1">
                  Free and open community news forum founded in Marlboro, NY, providing information and news about Southern Ulster County.
                </p>
              </div>

              <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.3em]">
                {navItems.map((item) => {
                  const isActive = item.href === '/' ? isStoriesPath : pathname.startsWith(item.href) && item.href !== '/';

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)] ${
                        isActive ? 'theme-text-primary font-semibold' : 'theme-text-muted'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <ThemeSwitcher currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
        <section>
          <div className="divide-y theme-border">
            {storyListings.map((story) => {
              const body = (
                <div className="space-y-3">
                  <h3 className="text-lg md:text-xl uppercase tracking-[0.08em] theme-text-primary leading-snug">
                    {story.title}
                  </h3>
                  <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.25em] theme-text-muted">
                    {story.date} — [{story.location}]
                  </p>
                  <p className="text-sm md:text-base theme-text-secondary leading-relaxed max-w-2xl">
                    {story.summary}
                  </p>
                </div>
              );

              return (
                <article key={story.id} className="py-6 md:py-8">
                  {story.href ? (
                    <Link
                      href={story.href}
                      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)] transition-colors duration-150 hover:opacity-90"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="group block focus:outline-none">{body}</div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
