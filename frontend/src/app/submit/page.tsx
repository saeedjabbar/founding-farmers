'use client';

import { FormEvent, useState } from 'react';

import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';

export default function SubmitPage() {
  const { theme, isDark, toggleTheme } = useEditorialTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim()) {
      setFeedback({ type: 'error', message: 'Please add a message before submitting.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({
          type: 'error',
          message:
            typeof result?.error === 'string'
              ? result.error
              : 'There was an issue sending your message. Please try again.',
        });
        return;
      }

      setFeedback({
        type: 'success',
        message: 'Thanks for reaching out — we received your message.',
      });
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Submit request failed:', error);
      setFeedback({
        type: 'error',
        message: 'There was an issue sending your message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <form className="space-y-6" aria-label="Submit tip form" onSubmit={handleSubmit}>
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
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="tip-email" className="sr-only">
                Email (optional)
              </label>
              <input
                id="tip-email"
                name="email"
                type="email"
                placeholder="Email (optional)"
                className="w-full rounded-2xl border theme-border bg-transparent px-4 py-3 text-sm theme-text-primary placeholder:theme-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="text-sm uppercase tracking-[0.2em] theme-text-primary hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-[var(--theme-bg)] disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Submit'}
            </button>

            <div aria-live="polite" className="text-sm">
              {feedback?.type === 'success' ? (
                <p className="theme-text-primary">{feedback.message}</p>
              ) : null}
              {feedback?.type === 'error' ? (
                <p className="theme-text-secondary">{feedback.message}</p>
              ) : null}
            </div>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
