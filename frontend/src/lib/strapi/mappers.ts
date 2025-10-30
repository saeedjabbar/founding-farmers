import type { BlocksContent } from '@strapi/blocks-react-renderer';
import { sanitizeVideoEmbed } from '@/lib/videoEmbeds';
import { getStrapiAssetUrl } from './client';
import type {
  PrivacyPolicyPage,
  PrivacyPolicyPageDocument,
  RecordDocument,
  SeoComponentDocument,
  SeoMetadata,
  SourceRecord,
  StandardsPage,
  StandardsPageDocument,
  Story,
  StoryDocument,
  StorySummary,
  SummaryCard,
  StrapiMedia,
  TimelineEntry,
  TimelineEntryDocument,
} from './types';
import { blocksToPlainText, hasBlocksContent } from './richText';

type StrapiMediaInput =
  | StrapiMedia
  | {
      data?:
        | {
            id?: unknown;
            attributes?: StrapiMedia | null;
          }
        | null;
    }
  | null
  | undefined;

function mapMedia(media?: StrapiMediaInput): StrapiMedia | undefined {
  if (!media) return undefined;

  if ('data' in media && media.data && media.data.attributes) {
    return mapMedia(media.data.attributes ?? undefined);
  }

  if ('url' in (media as StrapiMedia)) {
    const typed = media as StrapiMedia;
    if (!typed.url) return undefined;
    return {
      ...typed,
      url: getStrapiAssetUrl(typed.url) ?? typed.url,
    };
  }

  return undefined;
}

function splitCsv(value?: string | null): string[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? parts : undefined;
}

function normalizeStructuredData(value: unknown): unknown | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value : undefined;
  }
  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length > 0 ? value : undefined;
  }
  return value;
}

type SeoComponentInput =
  | SeoComponentDocument
  | {
      data?:
        | {
            attributes?: SeoComponentDocument | null;
          }
        | null;
    }
  | null
  | undefined;

function isSeoComponentDocument(value: unknown): value is SeoComponentDocument {
  return typeof value === 'object' && value !== null && 'id' in (value as Record<string, unknown>);
}

function normalizeSeoDocument(seo?: SeoComponentInput): SeoComponentDocument | undefined {
  if (!seo) return undefined;
  if (isSeoComponentDocument(seo)) {
    return seo;
  }
  if ('data' in seo && seo.data) {
    return normalizeSeoDocument(seo.data.attributes ?? undefined);
  }
  return undefined;
}

function mapSeoComponent(seo?: SeoComponentInput): SeoMetadata | null {
  const normalized = normalizeSeoDocument(seo);
  if (!normalized) return null;

  const metaImage = mapMedia(normalized.metaImage);
  const openGraphImage = mapMedia(normalized.openGraph?.ogImage);
  const hasOpenGraphValue =
    Boolean(normalized.openGraph?.ogTitle) ||
    Boolean(normalized.openGraph?.ogDescription) ||
    Boolean(normalized.openGraph?.ogUrl) ||
    Boolean(normalized.openGraph?.ogType) ||
    Boolean(openGraphImage);

  const openGraph = hasOpenGraphValue
    ? {
        title: normalized.openGraph?.ogTitle ?? undefined,
        description: normalized.openGraph?.ogDescription ?? undefined,
        url: normalized.openGraph?.ogUrl ?? undefined,
        type: normalized.openGraph?.ogType ?? undefined,
        image: openGraphImage ?? undefined,
      }
    : undefined;

  const keywords = splitCsv(normalized.keywords);
  const metaRobots = splitCsv(normalized.metaRobots);
  const structuredData = normalizeStructuredData(normalized.structuredData);

  const hasAnyValue =
    Boolean(normalized.metaTitle) ||
    Boolean(normalized.metaDescription) ||
    Boolean(metaImage) ||
    Boolean(openGraph) ||
    Boolean(keywords) ||
    Boolean(metaRobots) ||
    Boolean(normalized.metaViewport) ||
    Boolean(normalized.canonicalURL) ||
    Boolean(structuredData);

  if (!hasAnyValue) {
    return null;
  }

  return {
    metaTitle: normalized.metaTitle ?? undefined,
    metaDescription: normalized.metaDescription ?? undefined,
    metaImage,
    openGraph,
    keywords,
    metaRobots,
    metaViewport: normalized.metaViewport ?? undefined,
    canonicalURL: normalized.canonicalURL ?? undefined,
    structuredData,
  };
}

function normalizeBlocks(content?: BlocksContent | null): BlocksContent | undefined {
  if (!content || content.length === 0) {
    return undefined;
  }

  const normalized = content.map((node) => {
    if (!node) return node;
    if (node.type === 'image' && node.image?.url) {
      return {
        ...node,
        image: {
          ...node.image,
          url: getStrapiAssetUrl(node.image.url) ?? node.image.url,
        },
      };
    }
    return node;
  });

  return hasBlocksContent(normalized) ? normalized : undefined;
}

export function mapRecord(document: RecordDocument | null | undefined): SourceRecord | null {
  if (!document) return null;

  const mediaAsset = mapMedia(document.mediaAsset);

  const description = normalizeBlocks(document.description);
  const descriptionText = blocksToPlainText(description);
  const videoEmbed = sanitizeVideoEmbed(document.videoEmbed);
  const seo = mapSeoComponent(document.SEO ?? document.seo);
  const searchableContent = normalizeBlocks(document.searchableContent);

  return {
    id: String(document.documentId ?? document.id),
    title: document.title,
    slug: document.slug,
    description: description ?? undefined,
    descriptionText: descriptionText.length > 0 ? descriptionText : undefined,
    searchableContent: searchableContent ?? undefined,
    mediaType: document.mediaType ?? undefined,
    mediaAsset,
    mediaSource: document.mediaSource ?? (videoEmbed ? 'externalEmbed' : 'upload'),
    videoEmbed: videoEmbed ?? undefined,
    sourceUrl: document.sourceUrl ?? undefined,
    publishDate: document.publishDate ?? document.publishedAt ?? undefined,
    publishedAt: document.publishedAt ?? undefined,
    createdAt: document.createdAt ?? undefined,
    seo: seo ?? undefined,
  };
}

function mapTimelineEntry(document: TimelineEntryDocument): TimelineEntry {
  const records =
    document.records?.map((record) => mapRecord(record)).filter((record): record is SourceRecord => Boolean(record)) ??
    [];

  return {
    id: String(document.id),
    entryDate: document.entryDate,
    headline: document.headline,
    body: normalizeBlocks(document.body) ?? [],
    position:
      typeof document.position === 'number'
        ? document.position
        : document.position !== null && document.position !== undefined
          ? Number(document.position)
          : undefined,
    records,
  };
}

function mapSummary(document: StoryDocument): SummaryCard | null {
  if (!document.summaryEnabled || !document.summaryCard) {
    return null;
  }

  const heading = document.summaryCard.heading?.trim() || 'Summary';
  const bulletsArray =
    document.summaryCard.bulletsText
      ?.split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0) ?? [];

  const bodyBlocks = normalizeBlocks(document.summaryCard.body);
  const hasBody = hasBlocksContent(bodyBlocks);
  const hasBullets = bulletsArray.length > 0;

  if (!hasBody && !hasBullets) {
    return null;
  }

  return {
    heading,
    body: hasBody ? bodyBlocks : undefined,
    bullets: hasBullets ? bulletsArray : undefined,
  };
}

export function mapStory(document: StoryDocument): Story {
  const heroMedia = mapMedia(document.heroMedia);

  const timelineEntries =
    document.timelineEntries
      ?.map((timelineEntry, index) => ({ entry: mapTimelineEntry(timelineEntry), index }))
      .sort((a, b) => {
        const aPosition = a.entry.position ?? Number.POSITIVE_INFINITY;
        const bPosition = b.entry.position ?? Number.POSITIVE_INFINITY;
        if (aPosition !== bPosition) {
          return aPosition - bPosition;
        }

        const dateComparison = a.entry.entryDate.localeCompare(b.entry.entryDate);
        if (dateComparison !== 0) {
          return dateComparison;
        }

        return a.index - b.index;
      })
      .map(({ entry }) => entry) ?? [];
  const seo = mapSeoComponent(document.SEO ?? document.seo);

  return {
    id: String(document.documentId ?? document.id),
    title: document.title,
    slug: document.slug,
    blurb: document.blurb,
    authorName: document.authorName ?? 'Unknown',
    location: document.location ?? 'Marlborough',
    publishedDate: document.publishedDate ?? undefined,
    publishedAt: document.publishedAt ?? undefined,
    heroMedia,
    timelineEntries,
    summary: mapSummary(document),
    seo: seo ?? undefined,
  };
}

export function mapStorySummary(document: StoryDocument): StorySummary {
  return {
    id: String(document.documentId ?? document.id),
    title: document.title,
    slug: document.slug,
    location: document.location ?? 'Marlborough',
    publishedDate: document.publishedDate ?? undefined,
    publishedAt: document.publishedAt ?? undefined,
  };
}

export function mapStandardsPage(document: StandardsPageDocument | null | undefined): StandardsPage | null {
  if (!document) return null;
  const seo = mapSeoComponent(document.SEO ?? document.seo);

  return {
    id: String(document.documentId ?? document.id),
    title: document.title,
    body: normalizeBlocks(document.body) ?? [],
    seo: seo ?? undefined,
  };
}

export function mapPrivacyPolicyPage(document: PrivacyPolicyPageDocument | null | undefined): PrivacyPolicyPage | null {
  if (!document) return null;
  const seo = mapSeoComponent(document.SEO ?? document.seo);

  return {
    id: String(document.documentId ?? document.id),
    title: document.title,
    body: normalizeBlocks(document.body) ?? [],
    seo: seo ?? undefined,
  };
}
