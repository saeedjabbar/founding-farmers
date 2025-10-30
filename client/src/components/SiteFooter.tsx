import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="theme-surface theme-border border-t">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] theme-text-muted">©2025 Founding Farmers</p>
        <div className="flex flex-col gap-3 text-xs uppercase tracking-[0.2em] md:flex-row md:items-center md:gap-6">
          <Link
            href="/privacy-policy"
            className="transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)] theme-text-muted hover:text-[var(--theme-accent)]"
          >
            Privacy Policy
          </Link>
          <a
            href="https://x.com/foundingfarms"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)] theme-text-muted hover:text-[var(--theme-accent)]"
          >
            @FoundingFarms on X
          </a>
        </div>
      </div>
    </footer>
  );
}
