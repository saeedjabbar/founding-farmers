'use client';

import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';
import { SiteHeader } from '@/components/SiteHeader';
import type { SourceRecord } from '@/lib/strapi/types';
import Image from 'next/image';

interface RecordDetailPageProps {
  record: SourceRecord;
}

function renderMedia(record: SourceRecord) {
  if (!record.mediaType || !record.mediaAsset?.url) return null;

  if (record.mediaType === 'image') {
    return (
      <div className="relative w-full h-80 md:h-[420px] rounded-lg overflow-hidden border border-[var(--theme-border)]">
        <Image
          src={record.mediaAsset.url}
          alt={record.mediaAsset.alternativeText ?? record.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 960px"
        />
      </div>
    );
  }

  if (record.mediaType === 'audio') {
    return (
      <audio
        controls
        preload="metadata"
        className="w-full rounded-md border border-[var(--theme-border)]"
        src={record.mediaAsset.url}
      >
        Your browser does not support the audio tag.
      </audio>
    );
  }

  if (record.mediaType === 'video') {
    return (
      <video
        controls
        preload="metadata"
        className="w-full rounded-md border border-[var(--theme-border)]"
      >
        <source src={record.mediaAsset.url} type={record.mediaAsset.mime ?? undefined} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (record.mediaType === 'pdf') {
    return (
      <object
        data={record.mediaAsset.url}
        type={record.mediaAsset.mime ?? 'application/pdf'}
        className="w-full h-[600px] rounded-md border border-[var(--theme-border)]"
      >
        <p className="text-xs theme-text-secondary">
          PDF preview unavailable.{' '}
          <a href={record.mediaAsset.url} target="_blank" rel="noopener noreferrer" className="theme-accent underline">
            Download the document
          </a>
          .
        </p>
      </object>
    );
  }

  return null;
}

export function RecordDetailPage({ record }: RecordDetailPageProps) {
  const { theme, isDark, toggleTheme } = useEditorialTheme();

  return (
    <div className={`min-h-screen theme-bg ${themes[theme].className}`}>
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-14 space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] theme-text-muted">Source Record</p>
          <h1 className="theme-text-primary text-xl uppercase tracking-[0.08em] leading-snug">
            {record.title}
          </h1>
        </header>

        {record.shortBlurb && (
          <p className="theme-text-secondary text-sm leading-relaxed max-w-2xl">
            {record.shortBlurb}
          </p>
        )}

        {renderMedia(record)}

        {record.longDescription && (
          <div
            className="theme-text-secondary leading-relaxed space-y-3"
            dangerouslySetInnerHTML={{ __html: record.longDescription }}
          />
        )}

        {(record.sourceUrl || record.mediaAsset?.url) && (
          <div className="theme-border theme-surface border rounded-lg p-4 space-y-2 text-sm">
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
            {record.mediaAsset?.url && (
              <a
                href={record.mediaAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block theme-text-secondary hover:text-[var(--theme-accent)]"
              >
                Download media asset
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
