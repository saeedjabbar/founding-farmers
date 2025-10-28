import { getStrapiAssetUrl } from './client';
import type {
  RecordDocument,
  SourceRecord,
  Story,
  StoryDocument,
  SummaryCard,
  TimelineEntry,
  TimelineEntryComponent,
} from './types';

export function mapRecord(document: RecordDocument | null | undefined): SourceRecord | null {
  if (!document) return null;

  const mediaAsset = document.mediaAsset
    ? { ...document.mediaAsset, url: getStrapiAssetUrl(document.mediaAsset.url) ?? document.mediaAsset.url }
    : undefined;

  const rawDescription = document.description ?? '';
  const trimmedDescription = rawDescription.trim();

  return {
    id: String(document.documentId ?? document.id),
    title: document.title,
    slug: document.slug,
    description: trimmedDescription.length > 0 ? rawDescription : undefined,
    mediaType: document.mediaType ?? undefined,
    mediaAsset,
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
    body: component.body,
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

  const rawBody = document.summaryCard.body?.trim() ?? '';
  const bodyText = rawBody.replace(/<[^>]*>/g, '').trim();
  const hasBody = bodyText.length > 0;
  const hasBullets = bulletsArray.length > 0;

  if (!hasBody && !hasBullets) {
    return null;
  }

  return {
    heading,
    body: hasBody ? rawBody : undefined,
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
