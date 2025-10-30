import { RecordListPage } from '@/components/RecordListPage';
import { getRecords } from '@/lib/strapi/queries';

export const revalidate = 120;

type SearchParams = Record<string, string | string[] | undefined>;

interface RecordsPageProps {
  searchParams: Promise<SearchParams>;
}

function resolvePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return 1;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedPage = resolvePageParam(resolvedSearchParams.page);

  let result = await getRecords({ page: requestedPage });
  if (result.pagination.pageCount > 0 && requestedPage > result.pagination.pageCount) {
    result = await getRecords({ page: result.pagination.pageCount });
  }

  const { records, pagination } = result;

  return (
    <RecordListPage
      records={records}
      currentPage={pagination.page}
      pageCount={pagination.pageCount}
      basePath="/records"
    />
  );
}
