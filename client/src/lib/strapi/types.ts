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
  shortBlurb?: string | null;
  longDescription?: string | null;
  mediaAsset?: StrapiMedia | null;
  mediaType?: MediaType | null;
  sourceUrl?: string | null;
  publishDate?: string | null;
  publishedAt?: string | null;
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
  author?: string | null;
  publishedDate?: string | null;
  publishedAt?: string | null;
  heroMedia?: StrapiMedia | null;
  timelineEntries?: TimelineEntryComponent[] | null;
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
  author?: string | null;
  publishedDate?: string | null;
  publishedAt?: string | null;
  heroMedia?: StrapiMedia | null;
  timelineEntries: TimelineEntry[];
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
  shortBlurb?: string | null;
  longDescription?: string | null;
  mediaType?: MediaType | null;
  mediaAsset?: StrapiMedia | null;
  sourceUrl?: string | null;
  publishDate?: string | null;
}
