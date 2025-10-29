import { type NextRequest } from 'next/server';

import { resolveStrapiBaseUrl } from '@/lib/strapi/client';

const XSL_BASE_PATH = '/api/sitemap/xsl';
const REVALIDATE_SECONDS = 60 * 60;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await context.params;
  const segments = path ?? [];

  if (segments.length === 0) {
    return new Response('Not Found', { status: 404 });
  }

  const strapiBaseUrl = resolveStrapiBaseUrl();
  const normalizedPath = segments.map(encodeURIComponent).join('/');
  const upstreamUrl = `${strapiBaseUrl}${XSL_BASE_PATH}/${normalizedPath}`;

  const response = await fetch(upstreamUrl, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  const payload = await response.arrayBuffer();

  const headers = new Headers();
  const contentType = response.headers.get('content-type') ?? inferContentType(segments[segments.length - 1] ?? '');
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', response.headers.get('cache-control') ?? 'public, max-age=0, s-maxage=3600');

  return new Response(payload, {
    status: response.status,
    headers,
  });
}

function inferContentType(filename: string): string {
  if (filename.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filename.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filename.endsWith('.xsl')) return 'application/xml; charset=utf-8';
  return 'text/plain; charset=utf-8';
}
