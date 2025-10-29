import { PrivacyPolicyPage } from '@/components/PrivacyPolicyPage';
import { getPrivacyPolicyPage } from '@/lib/strapi/queries';
import type { PrivacyPolicyPage as PrivacyPolicyContent } from '@/lib/strapi/types';

export const revalidate = 120;

export default async function PrivacyPolicyRoute() {
  const page = (await getPrivacyPolicyPage()) ?? createFallbackPage();
  return <PrivacyPolicyPage page={page} />;
}

function createFallbackPage(): PrivacyPolicyContent {
  return {
    id: 'privacy-policy-fallback',
    title: 'Privacy Policy',
    body: [],
  };
}
