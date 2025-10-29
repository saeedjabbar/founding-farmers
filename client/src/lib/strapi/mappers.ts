import type { BlocksContent } from '@strapi/blocks-react-renderer';
import { sanitizeVideoEmbed } from '@/lib/videoEmbeds';
import { getStrapiAssetUrl } from './client';
import type {
  RecordDocument,
  SourceRecord,
  Story,
  StoryDocument,
  StorySummary,
  SummaryCard,
  TimelineEntry,
  TimelineEntryComponent,
} from './types';
import { blocksToPlainText, hasBlocksContent } from './richText';

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

  const mediaAsset = document.mediaAsset
    ? { ...document.mediaAsset, url: getStrapiAssetUrl(document.mediaAsset.url) ?? document.mediaAsset.url }
    : undefined;

  const description = normalizeBlocks(document.description);
  const descriptionText = blocksToPlainText(description);
  const videoEmbed = sanitizeVideoEmbed(document.videoEmbed);

  return {
    id: String(document.documentId ?? document.id),
    title: document.title,
    slug: document.slug,
    description: description ?? undefined,
    descriptionText: descriptionText.length > 0 ? descriptionText : undefined,
    mediaType: document.mediaType ?? undefined,
    mediaAsset,
    mediaSource: document.mediaSource ?? (videoEmbed ? 'externalEmbed' : 'upload'),
    videoEmbed: videoEmbed ?? undefined,
    sourceUrl: document.sourceUrl ?? undefined,
    publishDate: document.publishDate ?? document.publishedAt ?? undefined,
    publishedAt: document.publishedAt ?? undefined,
    createdAt: document.createdAt ?? undefined,
  };
}

function mapTimelineEntry(component: TimelineEntryComponent): TimelineEntry {
  const records =
    component.records?.map((record) => mapRecord(record)).filter((record): record is SourceRecord => Boolean(record)) ??
    [];

  return {
    id: String(component.id),
    entryDate: component.entryDate,
    headline: component.headline,
    body: normalizeBlocks(component.body) ?? [],
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
  const heroMedia = document.heroMedia
    ? { ...document.heroMedia, url: getStrapiAssetUrl(document.heroMedia.url) ?? document.heroMedia.url }
    : undefined;

  const timelineEntries =
    document.timelineEntries?.map(mapTimelineEntry).sort((a, b) => a.entryDate.localeCompare(b.entryDate)) ?? [];

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
