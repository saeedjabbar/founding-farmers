'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';

export default function NotFound() {
  const { theme, isDark, toggleTheme } = useEditorialTheme();

  return (
    <div className={`min-h-screen theme-bg ${themes[theme].className}`}>
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <section className="theme-surface theme-border border rounded-lg px-6 md:px-10 py-12 md:py-16 shadow-sm">
          <div className="flex flex-col gap-6 md:gap-8">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-dashed border-[var(--theme-border)] text-[11px] font-semibold tracking-[0.35em] uppercase text-[var(--theme-accent)] self-center md:self-start">
              404
            </span>

            <header className="space-y-3 text-center md:text-left">
              <p className="text-[11px] uppercase tracking-[0.35em] theme-text-muted">
                Story file missing
              </p>
              <h1 className="text-2xl md:text-3xl uppercase tracking-[0.1em] theme-text-primary">
                We couldn&apos;t locate that page
              </h1>
              <p className="text-sm md:text-base theme-text-secondary leading-relaxed max-w-2xl mx-auto md:mx-0">
                The report you were following has either moved or no longer exists. You can browse the latest investigations or share a tip to help guide our newsroom.
              </p>
            </header>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 uppercase text-xs tracking-[0.25em] bg-[var(--theme-accent)] text-white transition-colors duration-150 hover:bg-[var(--theme-accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)]"
              >
                Return to stories
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 uppercase text-xs tracking-[0.25em] theme-surface theme-border border text-[var(--theme-accent)] transition-colors duration-150 hover:text-[var(--theme-accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)]"
              >
                Share a newsroom tip
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
