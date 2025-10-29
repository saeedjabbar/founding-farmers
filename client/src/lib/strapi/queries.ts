import { mapRecord, mapStory } from './mappers';
import type { SourceRecord, Story, StoryDocument, RecordDocument, StrapiListResponse } from './types';
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

export async function getStories(): Promise<Story[]> {
  try {
    const response = await strapiFetch<StrapiListResponse<StoryDocument>>('/api/stories', {
      params: withPublicationState({
        ...STORY_POPULATE,
        sort: ['publishedDate:desc', 'publishedAt:desc'],
      }),
      cache: 'no-store',
    });

    return sortStoriesByPublishedDate(response.data.map(mapStory));
  } catch (error) {
    console.warn('[strapi] Failed to load stories:', error);
    return [];
  }
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
