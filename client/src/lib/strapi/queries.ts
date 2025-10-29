import { mapRecord, mapStory } from './mappers';
import type {
  SourceRecord,
  Story,
  StoryDocument,
  RecordDocument,
  StrapiListResponse,
  StrapiPagination,
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
