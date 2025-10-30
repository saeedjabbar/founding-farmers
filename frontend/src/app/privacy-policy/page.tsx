import type { Metadata } from 'next';
import { PrivacyPolicyPage } from '@/components/PrivacyPolicyPage';
import { getPrivacyPolicyPage } from '@/lib/strapi/queries';
import type { PrivacyPolicyPage as PrivacyPolicyContent } from '@/lib/strapi/types';
import { createPageMetadata, serializeStructuredData } from '@/lib/seo';

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getPrivacyPolicyPage()) ?? createFallbackPage();
  return createPageMetadata(page.seo, {
    title: page.title,
    description: 'Privacy policy for The Chronicle Timeline.',
    path: '/privacy-policy',
  });
}

export default async function PrivacyPolicyRoute() {
  const page = (await getPrivacyPolicyPage()) ?? createFallbackPage();
  const structuredData = serializeStructuredData(page.seo?.structuredData);

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      )}
      <PrivacyPolicyPage page={page} />
    </>
  );
}

function createFallbackPage(): PrivacyPolicyContent {
  return {
    id: 'privacy-policy-fallback',
    title: 'Privacy Policy',
    body: [],
    seo: undefined,
  };
}
