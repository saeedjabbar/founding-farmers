import { getStrapiAssetUrl } from './client';
import type {
  RecordDocument,
  SourceRecord,
  Story,
  StoryDocument,
  TimelineEntry,
  TimelineEntryComponent,
} from './types';

export function mapRecord(document: RecordDocument | null | undefined): SourceRecord | null {
  if (!document) return null;

  const mediaAsset = document.mediaAsset
    ? { ...document.mediaAsset, url: getStrapiAssetUrl(document.mediaAsset.url) ?? document.mediaAsset.url }
    : undefined;

  return {
    id: String(document.documentId ?? document.id),
    title: document.title,
    slug: document.slug,
    shortBlurb: document.shortBlurb ?? undefined,
    longDescription: document.longDescription ?? undefined,
    mediaType: document.mediaType ?? undefined,
    mediaAsset,
    sourceUrl: document.sourceUrl ?? undefined,
    publishDate: document.publishDate ?? document.publishedAt ?? undefined,
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
    author: document.author ?? undefined,
    publishedDate: document.publishedDate ?? undefined,
    publishedAt: document.publishedAt ?? undefined,
    heroMedia,
    timelineEntries,
  };
}
