'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { navItems } from '@/lib/navigation';

type SiteHeaderProps = {
  isDark: boolean;
  onToggleTheme: () => void;
};

export function SiteHeader({ isDark, onToggleTheme }: SiteHeaderProps) {
  const pathname = usePathname();
  const isStoriesPath = pathname === '/' || pathname.startsWith('/story');

  return (
    <header className="theme-surface theme-border border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="theme-text-primary text-lg md:text-xl font-semibold leading-tight">
                <Link
                  href="/"
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)] transition-opacity duration-150 hover:opacity-80"
                >
                  The Founding Farmers
                </Link>
              </h1>
              <p className="text-xs theme-text-muted mt-1">
                Free and open community news forum founded in Marlboro, NY, providing information and news about Southern Ulster County.
              </p>
            </div>

            <nav
              aria-label="Primary"
              className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.3em]"
            >
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

          <div className="flex items-center pt-1 md:pt-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-pressed={isDark}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center gap-2 rounded-full theme-surface theme-border border px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition-opacity duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)] hover:opacity-80"
            >
              {isDark ? (
                <Moon className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Sun className="h-3.5 w-3.5" aria-hidden />
              )}
              <span>{isDark ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
