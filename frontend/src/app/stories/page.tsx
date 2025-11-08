import { StoryListPage } from '@/components/StoryListPage';
import { getStories } from '@/lib/strapi/queries';
import { formatStrapiDate } from '@/lib/dates';

export const revalidate = 120;

type SearchParams = Record<string, string | string[] | undefined>;

interface StoriesPageProps {
  searchParams: Promise<SearchParams>;
}

function resolvePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return 1;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedPage = resolvePageParam(resolvedSearchParams.page);

  let result = await getStories({ page: requestedPage });
  if (result.pagination.pageCount > 0 && requestedPage > result.pagination.pageCount) {
    result = await getStories({ page: result.pagination.pageCount });
  }

  const { stories, pagination } = result;

  // Format dates on the server to avoid hydration mismatches
  const storiesWithFormattedDates = stories.map((story) => ({
    ...story,
    formattedPublishedDate: formatStrapiDate(story.publishedDate ?? story.publishedAt),
  }));

  return (
    <StoryListPage
      stories={storiesWithFormattedDates}
      currentPage={pagination.page}
      pageCount={pagination.pageCount}
      basePath="/stories"
    />
  );
}
