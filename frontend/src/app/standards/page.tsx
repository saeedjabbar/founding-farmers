import type { Metadata } from 'next';
import { StandardsPage } from '@/components/StandardsPage';
import { getStandardsPage } from '@/lib/strapi/queries';
import type { StandardsPage as StandardsPageContent } from '@/lib/strapi/types';
import { createPageMetadata, serializeStructuredData } from '@/lib/seo';

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getStandardsPage()) ?? createFallbackPage();
  return createPageMetadata(page.seo, {
    title: page.title,
    description: 'Editorial standards and guidelines for The Chronicle Timeline.',
    path: '/standards',
  });
}

export default async function StandardsRoute() {
  const page = (await getStandardsPage()) ?? createFallbackPage();
  const structuredData = serializeStructuredData(page.seo?.structuredData);

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      )}
      <StandardsPage page={page} />
    </>
  );
}

function createFallbackPage(): StandardsPageContent {
  return {
    id: 'standard-fallback',
    title: 'Editorial Standards',
    body: [],
    seo: undefined,
  };
}
