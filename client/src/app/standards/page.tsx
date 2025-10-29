import { StandardsPage } from '@/components/StandardsPage';
import { getStandardsPage } from '@/lib/strapi/queries';
import type { StandardsPage as StandardsPageContent } from '@/lib/strapi/types';

export const revalidate = 120;

export default async function StandardsRoute() {
  const page = (await getStandardsPage()) ?? createFallbackPage();
  return <StandardsPage page={page} />;
}

function createFallbackPage(): StandardsPageContent {
  return {
    id: 'standard-fallback',
    title: 'Editorial Standards',
    body: [],
  };
}
