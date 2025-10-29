import type { BlocksContent } from '@strapi/blocks-react-renderer';

export type StrapiID = number | string;

export type MediaType = 'image' | 'video' | 'audio' | 'pdf' | 'document';
export type MediaSource = 'upload' | 'externalEmbed';
export type VideoProvider = 'youtube' | 'vimeo' | 'other';
export type VideoAspectRatio = '16:9' | '4:3' | '1:1' | '9:16';
export type ReferrerPolicyValue =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

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

export interface OpenGraphDocument {
  id: StrapiID;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: StrapiMedia | null;
  ogUrl?: string | null;
  ogType?: string | null;
}

export interface SeoComponentDocument {
  id: StrapiID;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImage?: StrapiMedia | null;
  openGraph?: OpenGraphDocument | null;
  keywords?: string | null;
  metaRobots?: string | null;
  metaViewport?: string | null;
  canonicalURL?: string | null;
  structuredData?: unknown;
}

export interface OpenGraphMetadata {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  image?: StrapiMedia | null;
}

export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: StrapiMedia | null;
  openGraph?: OpenGraphMetadata;
  keywords?: string[];
  metaRobots?: string[];
  metaViewport?: string;
  canonicalURL?: string;
  structuredData?: unknown;
}

export interface VideoEmbedDocument {
  provider?: VideoProvider | null;
  title?: string | null;
  embedHtml?: string | null;
  aspectRatio?: VideoAspectRatio | null;
}

export interface VideoIframeAttributes {
  src: string;
  allow?: string;
  referrerPolicy?: ReferrerPolicyValue;
  allowFullScreen: boolean;
  loading?: 'lazy' | 'eager';
}

export interface VideoEmbed {
  provider: VideoProvider;
  title?: string;
  embedHtml: string;
  aspectRatio: VideoAspectRatio;
  iframe: VideoIframeAttributes;
}

export interface RecordDocument {
  id: StrapiID;
  documentId?: string;
  title: string;
  slug: string;
  description?: BlocksContent | null;
  mediaAsset?: StrapiMedia | null;
  mediaType?: MediaType | null;
  mediaSource?: MediaSource | null;
  videoEmbed?: VideoEmbedDocument | null;
  sourceUrl?: string | null;
  publishDate?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  SEO?: SeoComponentDocument | null;
  seo?: SeoComponentDocument | null;
}

export interface TimelineEntryComponent {
  id: StrapiID;
  entryDate: string;
  headline: string;
  body: BlocksContent;
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
  SEO?: SeoComponentDocument | null;
  seo?: SeoComponentDocument | null;
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiMeta {
  pagination?: StrapiPagination;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta?: StrapiMeta;
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
  seo?: SeoMetadata | null;
}

export interface StorySummary {
  id: string;
  title: string;
  slug: string;
  location: string;
  publishedDate?: string | null;
  publishedAt?: string | null;
}

export interface TimelineEntry {
  id: string;
  entryDate: string;
  headline: string;
  body: BlocksContent;
  records: SourceRecord[];
}

export interface SourceRecord {
  id: string;
  title: string;
  slug: string;
  description?: BlocksContent | null;
  descriptionText?: string | null;
  mediaType?: MediaType | null;
  mediaAsset?: StrapiMedia | null;
  mediaSource?: MediaSource;
  videoEmbed?: VideoEmbed | null;
  sourceUrl?: string | null;
  publishDate?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  seo?: SeoMetadata | null;
}

export interface SummaryCardDocument {
  heading?: string | null;
  body?: BlocksContent | null;
  bulletsText?: string | null;
}

export interface SummaryCard {
  heading: string;
  body?: BlocksContent | null;
  bullets?: string[];
}

export interface StandardsPageDocument {
  id: StrapiID;
  documentId?: string;
  title: string;
  body?: BlocksContent | null;
  SEO?: SeoComponentDocument | null;
  seo?: SeoComponentDocument | null;
}

export interface StandardsPage {
  id: string;
  title: string;
  body: BlocksContent;
  seo?: SeoMetadata | null;
}

export interface PrivacyPolicyPageDocument {
  id: StrapiID;
  documentId?: string;
  title: string;
  body?: BlocksContent | null;
  SEO?: SeoComponentDocument | null;
  seo?: SeoComponentDocument | null;
}

export interface PrivacyPolicyPage {
  id: string;
  title: string;
  body: BlocksContent;
  seo?: SeoMetadata | null;
}
