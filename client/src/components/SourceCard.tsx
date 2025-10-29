import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, FileText, Image as ImageIcon, Mic, File, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { BlocksContent } from '@strapi/blocks-react-renderer';
import type { MediaSource, MediaType, StrapiMedia, VideoEmbed } from '@/lib/strapi/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { PdfViewer } from '@/components/PdfViewer';
import { StrapiRichText } from '@/components/StrapiRichText';
import VideoEmbedPlayer from '@/components/VideoEmbedPlayer';

interface SourceCardProps {
  title: string;
  summary: string;
  content?: BlocksContent | null;
  url?: string;
  mediaType?: MediaType;
  mediaAsset?: StrapiMedia | null;
  mediaSource?: MediaSource;
  videoEmbed?: VideoEmbed | null;
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
  title: string,
  mediaSource: MediaSource | undefined,
  videoEmbed: VideoEmbed | null | undefined
) {
  if (!mediaType) return null;

  if (mediaType === 'video' && mediaSource === 'externalEmbed' && videoEmbed) {
    return <VideoEmbedPlayer embed={videoEmbed} className="mt-2" />;
  }

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
          unoptimized
        />
      </div>
    );
  }

  if (mediaType === 'audio') {
    return (
      <AudioPlayer
        src={assetUrl}
        type={mediaAsset?.mime}
        className="mt-2"
        preload="metadata"
        size="compact"
      />
    );
  }

  if (mediaType === 'video') {
    if (!mediaAsset?.url && mediaSource === 'externalEmbed') {
      return null;
    }

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

export function SourceCard({
  title,
  summary,
  content,
  url,
  mediaType,
  mediaAsset,
  mediaSource,
  videoEmbed,
  recordSlug,
}: SourceCardProps) {
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
          {summary && <p className="text-xs theme-text-muted mt-1">{summary}</p>}
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
              {content && (
                <StrapiRichText
                  content={content}
                  className="text-xs theme-text-secondary space-y-2 mb-3"
                  paragraphClassName="leading-relaxed"
                  listClassName="pl-4 space-y-1.5"
                />
              )}
              {renderMediaPreview(mediaType, mediaAsset, previewUrl, title, mediaSource, videoEmbed)}
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
