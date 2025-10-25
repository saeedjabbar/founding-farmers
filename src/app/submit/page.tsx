'use client';

import { SiteHeader } from '@/components/SiteHeader';
import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';

export default function SubmitPage() {
  const { theme, isDark, toggleTheme } = useEditorialTheme();

  return (
    <div className={`min-h-screen theme-bg ${themes[theme].className}`}>
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <section className="space-y-8">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-lg md:text-xl font-semibold theme-text-primary leading-tight">
              Submit tips and public records requests.
            </h1>
            <p className="text-sm theme-text-secondary leading-relaxed">
              Request support with document retrieval, or provide additional context for ongoing investigations. You can include your contact details if follow-up is welcome.
            </p>
          </div>

          <form className="space-y-6" aria-label="Submit tip form">
            <div>
              <label htmlFor="tip-name" className="sr-only">
                Name (optional)
              </label>
              <input
                id="tip-name"
                name="name"
                type="text"
                placeholder="Name (optional)"
                className="w-full rounded-2xl border theme-border bg-transparent px-4 py-3 text-sm theme-text-primary placeholder:theme-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="tip-contact" className="sr-only">
                Contact (optional)
              </label>
              <input
                id="tip-contact"
                name="contact"
                type="text"
                placeholder="Contact (optional)"
                className="w-full rounded-2xl border theme-border bg-transparent px-4 py-3 text-sm theme-text-primary placeholder:theme-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="tip-message" className="sr-only">
                Your message
              </label>
              <textarea
                id="tip-message"
                name="message"
                rows={6}
                placeholder="Your message..."
                className="w-full rounded-2xl border theme-border bg-transparent px-4 py-3 text-sm theme-text-primary placeholder:theme-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="text-sm uppercase tracking-[0.2em] theme-text-primary hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)]"
            >
              Submit
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
