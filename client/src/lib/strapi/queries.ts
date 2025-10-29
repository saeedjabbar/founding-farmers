import { mapRecord, mapStandardsPage, mapStory, mapStorySummary } from './mappers';
import type {
  SourceRecord,
  Story,
  StoryDocument,
  RecordDocument,
  StrapiListResponse,
  StrapiPagination,
  StorySummary,
  StandardsPage,
  StandardsPageDocument,
  StrapiSingleResponse,
} from './types';
import { strapiFetch, type StrapiQueryParams } from './client';

const STORY_POPULATE: StrapiQueryParams = {
  populate: {
    timelineEntries: {
      populate: {
        records: {
          populate: ['mediaAsset', 'videoEmbed'],
        },
      },
    },
    heroMedia: true,
    summaryCard: true,
  },
};

function withPublicationState(params: StrapiQueryParams = {}): StrapiQueryParams {
  const useDrafts = process.env.STRAPI_PREVIEW_MODE === 'true';
  return {
    ...params,
    ...(useDrafts ? { publicationState: 'preview' } : {}),
  };
}

function parsePublicationDateTime(value?: string | null): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function sortStoriesByPublishedDate(stories: Story[]): Story[] {
  return stories.sort((a, b) => {
    const aTimestamp =
      parsePublicationDateTime(a.publishedDate) ?? parsePublicationDateTime(a.publishedAt) ?? Number.NEGATIVE_INFINITY;
    const bTimestamp =
      parsePublicationDateTime(b.publishedDate) ?? parsePublicationDateTime(b.publishedAt) ?? Number.NEGATIVE_INFINITY;

    if (aTimestamp === bTimestamp) {
      return 0;
    }

    return bTimestamp - aTimestamp;
  });
}

interface GetStoriesOptions {
  page?: number;
  pageSize?: number;
}

export interface StoryListResult {
  stories: Story[];
  pagination: StrapiPagination;
}

function normalizePagination(
  meta: StrapiPagination | undefined,
  fallbackPage: number,
  fallbackPageSize: number,
  totalItems: number
): StrapiPagination {
  const safePageSize = fallbackPageSize > 0 ? fallbackPageSize : 10;
  const pageSize = meta?.pageSize && meta.pageSize > 0 ? meta.pageSize : safePageSize;
  const total = Math.max(meta?.total ?? totalItems, 0);
  const computedPageCount = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
  const pageCount = meta?.pageCount && meta.pageCount > 0 ? meta.pageCount : computedPageCount || 1;
  const page = meta?.page && meta.page > 0 ? meta.page : fallbackPage;

  return {
    page: Math.max(page, 1),
    pageSize,
    pageCount: Math.max(pageCount, 1),
    total,
  };
}

export async function getStories(options: GetStoriesOptions = {}): Promise<StoryListResult> {
  const { page = 1, pageSize = 10 } = options;
  try {
    const response = await strapiFetch<StrapiListResponse<StoryDocument>>('/api/stories', {
      params: withPublicationState({
        ...STORY_POPULATE,
        sort: ['publishedDate:desc', 'publishedAt:desc'],
        pagination: { page, pageSize },
      }),
      cache: 'no-store',
    });

    const stories = sortStoriesByPublishedDate(response.data.map(mapStory));
    const pagination = normalizePagination(response.meta?.pagination, page, pageSize, stories.length);

    return { stories, pagination };
  } catch (error) {
    console.warn('[strapi] Failed to load stories:', error);
    return {
      stories: [],
      pagination: {
        page: Math.max(page, 1),
        pageSize: pageSize > 0 ? pageSize : 10,
        pageCount: 1,
        total: 0,
      },
    };
  }
}

export async function getAllStories(): Promise<Story[]> {
  const aggregatedStories: Story[] = [];
  const pageSize = 100;
  let page = 1;

  while (true) {
    const { stories, pagination } = await getStories({ page, pageSize });
    aggregatedStories.push(...stories);

    if (page >= pagination.pageCount) {
      break;
    }

    page += 1;
  }

  return sortStoriesByPublishedDate(aggregatedStories);
}

function sortRecordsByPublishedDate(records: SourceRecord[]): SourceRecord[] {
  return records.sort((a, b) => {
    const aTimestamp =
      parsePublicationDateTime(a.publishDate) ??
      parsePublicationDateTime(a.publishedAt) ??
      parsePublicationDateTime(a.createdAt) ??
      Number.NEGATIVE_INFINITY;
    const bTimestamp =
      parsePublicationDateTime(b.publishDate) ??
      parsePublicationDateTime(b.publishedAt) ??
      parsePublicationDateTime(b.createdAt) ??
      Number.NEGATIVE_INFINITY;

    if (aTimestamp === bTimestamp) {
      return 0;
    }

    return bTimestamp - aTimestamp;
  });
}

interface GetRecordsOptions {
  page?: number;
  pageSize?: number;
}

export interface RecordListResult {
  records: SourceRecord[];
  pagination: StrapiPagination;
}

export async function getRecords(options: GetRecordsOptions = {}): Promise<RecordListResult> {
  const { page = 1, pageSize = 10 } = options;
  try {
    const response = await strapiFetch<StrapiListResponse<RecordDocument>>('/api/records', {
      params: withPublicationState({
        populate: { mediaAsset: true, videoEmbed: true },
        sort: ['publishDate:desc', 'publishedAt:desc', 'createdAt:desc'],
        pagination: { page, pageSize },
      }),
      cache: 'no-store',
    });

    const records =
      response.data
        .map((document) => mapRecord(document))
        .filter((record): record is SourceRecord => Boolean(record)) ?? [];

    const sortedRecords = sortRecordsByPublishedDate(records);
    const pagination = normalizePagination(response.meta?.pagination, page, pageSize, sortedRecords.length);

    return { records: sortedRecords, pagination };
  } catch (error) {
    console.warn('[strapi] Failed to load records:', error);
    return {
      records: [],
      pagination: {
        page: Math.max(page, 1),
        pageSize: pageSize > 0 ? pageSize : 10,
        pageCount: 1,
        total: 0,
      },
    };
  }
}

export async function getAllRecords(): Promise<SourceRecord[]> {
  const aggregatedRecords: SourceRecord[] = [];
  const pageSize = 100;
  let page = 1;

  while (true) {
    const { records, pagination } = await getRecords({ page, pageSize });
    aggregatedRecords.push(...records);

    if (page >= pagination.pageCount) {
      break;
    }

    page += 1;
  }

  return sortRecordsByPublishedDate(aggregatedRecords);
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  try {
    const response = await strapiFetch<StrapiListResponse<StoryDocument>>('/api/stories', {
      params: withPublicationState({
        ...STORY_POPULATE,
        filters: { slug: { $eq: slug } },
        pagination: { page: 1, pageSize: 1 },
      }),
      cache: 'no-store',
    });

    const [story] = response.data;
    return story ? mapStory(story) : null;
  } catch (error) {
    console.warn(`[strapi] Failed to load story for slug "${slug}":`, error);
    return null;
  }
}

export async function getRecordBySlug(slug: string): Promise<SourceRecord | null> {
  try {
    const response = await strapiFetch<StrapiListResponse<RecordDocument>>('/api/records', {
      params: withPublicationState({
        populate: { mediaAsset: true, videoEmbed: true },
        filters: { slug: { $eq: slug } },
        pagination: { page: 1, pageSize: 1 },
      }),
      cache: 'no-store',
    });

    const [record] = response.data;
    return mapRecord(record) ?? null;
  } catch (error) {
    console.warn(`[strapi] Failed to load record for slug "${slug}":`, error);
    return null;
  }
}

export async function getStoriesFeaturingRecord(recordSlug: string): Promise<StorySummary[]> {
  try {
    const response = await strapiFetch<StrapiListResponse<StoryDocument>>('/api/stories', {
      params: withPublicationState({
        filters: {
          timelineEntries: {
            records: {
              slug: { $eq: recordSlug },
            },
          },
        },
        fields: ['title', 'slug', 'location', 'publishedDate', 'publishedAt', 'documentId'],
        pagination: { page: 1, pageSize: 50 },
        sort: ['publishedDate:desc', 'publishedAt:desc'],
      }),
      cache: 'no-store',
    });

    const summaries = response.data.map(mapStorySummary);
    const seen = new Set<string>();
    return summaries.filter((story) => {
      if (seen.has(story.slug)) return false;
      seen.add(story.slug);
      return true;
    });
  } catch (error) {
    console.warn(`[strapi] Failed to load stories for record slug "${recordSlug}":`, error);
    return [];
  }
}

export async function getStandardsPage(): Promise<StandardsPage | null> {
  try {
    const response = await strapiFetch<StrapiSingleResponse<StandardsPageDocument>>('/api/standard', {
      params: withPublicationState({}),
      cache: 'no-store',
    });

    return mapStandardsPage(response.data);
  } catch (error) {
    console.warn('[strapi] Failed to load standards page:', error);
    return null;
  }
}
