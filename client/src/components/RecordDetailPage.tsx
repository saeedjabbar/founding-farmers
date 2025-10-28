'use client';

import { themes } from '@/lib/themes';
import { useEditorialTheme } from '@/lib/useEditorialTheme';
import { SiteHeader } from '@/components/SiteHeader';
import { PdfViewer } from '@/components/PdfViewer';
import type { SourceRecord } from '@/lib/strapi/types';
import Image from 'next/image';
import Link from 'next/link';

interface RecordDetailPageProps {
  record: SourceRecord;
}

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
        />
      </div>
    );
  }

  if (record.mediaType === 'audio') {
    return (
      <audio controls preload="metadata" className="w-full rounded-md border border-[var(--theme-border)]" src={assetUrl}>
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
        <source src={assetUrl} type={record.mediaAsset?.mime ?? undefined} />
        Your browser does not support the video tag.
      </video>
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

export function RecordDetailPage({ record }: RecordDetailPageProps) {
  const { theme, isDark, toggleTheme } = useEditorialTheme();

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
                <div
                  className="theme-text-secondary text-sm leading-relaxed max-w-2xl space-y-3 record-rich-text"
                  dangerouslySetInnerHTML={{ __html: record.description }}
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
          <div className="p-6 md:p-8">
            {renderMedia(record) ?? (
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
      </main>
    </div>
  );
}
