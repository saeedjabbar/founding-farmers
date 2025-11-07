import { type NextRequest } from 'next/server';

import { resolveStrapiBaseUrl } from '@/lib/strapi/client';

const SITEMAP_PATH = '/api/sitemap/index.xml';
const FALLBACK_REVALIDATE_SECONDS = 60 * 60;

export async function GET(request: NextRequest): Promise<Response> {
  const strapiBaseUrl = resolveStrapiBaseUrl();
  const searchParams = new URLSearchParams();
  const page = request.nextUrl.searchParams.get('page');

  if (page) {
    searchParams.set('page', page);
  }

  const cmsUrl = `${strapiBaseUrl}${SITEMAP_PATH}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(cmsUrl, {
    headers: {
      Accept: 'application/xml',
    },
    next: { revalidate: FALLBACK_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    const statusText = response.statusText || 'Service Unavailable';
    return new Response(`Sitemap temporarily unavailable: ${statusText}`, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const sitemap = await response.text();

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
