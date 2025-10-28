import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, FileText, Image as ImageIcon, Mic, File, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { MediaType, StrapiMedia } from '@/lib/strapi/types';
import { PdfViewer } from '@/components/PdfViewer';

interface SourceCardProps {
  title: string;
  summary: string;
  content?: string;
  url?: string;
  mediaType?: MediaType;
  mediaAsset?: StrapiMedia | null;
  recordSlug?: string;
}

const iconMap: Record<NonNullable<MediaType>, typeof FileText> = {
  pdf: FileText,
  image: ImageIcon,
  audio: Mic,
  video: Film,
  document: File,
};

function renderMediaPreview(
  mediaType: MediaType | undefined,
  mediaAsset: StrapiMedia | null | undefined,
  fallbackUrl: string | undefined,
  title: string
) {
  if (!mediaType) return null;

  const assetUrl = mediaAsset?.url ?? fallbackUrl;
  if (!assetUrl) return null;

  const alt = mediaAsset?.alternativeText ?? mediaAsset?.name ?? 'Source media';
  const normalizedMime = mediaAsset?.mime?.toLowerCase();
  const isPdfMedia =
    mediaType === 'pdf' ||
    normalizedMime?.includes('pdf') ||
    assetUrl.toLowerCase().endsWith('.pdf');

  if (mediaType === 'image' && mediaAsset?.url) {
    return (
      <div className="relative w-full h-48 md:h-40 rounded-md overflow-hidden border border-[var(--theme-border)]">
        <Image
          src={mediaAsset.url}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
        />
      </div>
    );
  }

  if (mediaType === 'audio') {
    return (
      <audio
        controls
        preload="metadata"
        className="w-full mt-2"
        src={assetUrl}
      >
        Your browser does not support the audio tag.
      </audio>
    );
  }

  if (mediaType === 'video') {
    return (
      <video
        controls
        preload="metadata"
        className="w-full rounded-md mt-2 border border-[var(--theme-border)]"
      >
        <source src={assetUrl} type={mediaAsset?.mime ?? undefined} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (isPdfMedia) {
    return (
      <PdfViewer
        fileUrl={assetUrl}
        downloadUrl={assetUrl}
        title={title}
        className="mt-2"
      />
    );
  }

  if (mediaType === 'document') {
    return (
      <div className="mt-2">
        <object
          data={assetUrl}
          type={mediaAsset?.mime ?? 'application/pdf'}
          className="w-full h-56 rounded-md border border-[var(--theme-border)]"
        >
          <p className="text-xs theme-text-secondary">
            PDF preview unavailable.{' '}
            <a href={assetUrl} target="_blank" rel="noopener noreferrer" className="theme-accent underline">
              Download the document
            </a>
            .
          </p>
        </object>
      </div>
    );
  }

  return null;
}

export function SourceCard({ title, summary, content, url, mediaType, mediaAsset, recordSlug }: SourceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const iconKey = mediaType ?? 'document';
  const Icon = iconMap[iconKey] ?? File;
  const accordionId = `source-card-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const previewUrl = mediaAsset?.url ?? url;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="theme-border theme-surface border rounded-lg shadow-sm overflow-hidden source-content source-card"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-start gap-3 transition-colors text-left hover:opacity-90"
        aria-expanded={isOpen}
        aria-controls={accordionId}
      >
        <Icon className="w-4 h-4 theme-text-secondary mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm theme-text-primary">{title}</h4>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 theme-text-muted flex-shrink-0" />
            </motion.div>
          </div>
          <p className="text-xs theme-text-muted mt-1">{summary}</p>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="theme-border border-t"
            id={accordionId}
          >
            <div className="px-4 py-3 theme-bg">
              {content && <p className="text-xs theme-text-secondary mb-3">{content}</p>}
              {renderMediaPreview(mediaType, mediaAsset, previewUrl, title)}
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs theme-accent hover:underline"
                >
                  View Source →
                </a>
              )}
              {recordSlug && (
                <div className="mt-3">
                  <Link
                    href={`/records/${recordSlug}`}
                    className="inline-flex items-center gap-2 text-xs theme-text-secondary hover:text-[var(--theme-accent)]"
                  >
                    Visit record details ↗
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
