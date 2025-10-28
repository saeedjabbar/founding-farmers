export type StrapiID = number | string;

export type MediaType = 'image' | 'video' | 'audio' | 'pdf' | 'document';

export interface StrapiMedia {
  id: StrapiID;
  documentId?: string;
  url: string;
  mime: string;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  size?: number | null;
  ext?: string | null;
}

export interface RecordDocument {
  id: StrapiID;
  documentId?: string;
  title: string;
  slug: string;
  description?: string | null;
  mediaAsset?: StrapiMedia | null;
  mediaType?: MediaType | null;
  sourceUrl?: string | null;
  publishDate?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TimelineEntryComponent {
  id: StrapiID;
  entryDate: string;
  headline: string;
  body: string;
  records?: RecordDocument[] | null;
}

export interface StoryDocument {
  id: StrapiID;
  documentId?: string;
  title: string;
  slug: string;
  blurb: string;
  authorName?: string | null;
  location?: string | null;
  publishedDate?: string | null;
  publishedAt?: string | null;
  heroMedia?: StrapiMedia | null;
  timelineEntries?: TimelineEntryComponent[] | null;
  summaryEnabled?: boolean | null;
  summaryCard?: SummaryCardDocument | null;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T | null;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  blurb: string;
  authorName: string;
  location: string;
  publishedDate?: string | null;
  publishedAt?: string | null;
  heroMedia?: StrapiMedia | null;
  timelineEntries: TimelineEntry[];
  summary?: SummaryCard | null;
}

export interface TimelineEntry {
  id: string;
  entryDate: string;
  headline: string;
  body: string;
  records: SourceRecord[];
}

export interface SourceRecord {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  mediaType?: MediaType | null;
  mediaAsset?: StrapiMedia | null;
  sourceUrl?: string | null;
  publishDate?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
}

export interface SummaryCardDocument {
  heading?: string | null;
  body?: string | null;
  bulletsText?: string | null;
}

export interface SummaryCard {
  heading: string;
  body?: string | null;
  bullets?: string[];
}
