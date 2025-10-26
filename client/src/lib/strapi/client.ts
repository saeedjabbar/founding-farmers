import 'server-only';

type StrapiPrimitive = string | number | boolean | null | undefined;

export interface StrapiQueryParams {
  [key: string]: StrapiQueryValue;
}

export type StrapiQueryValue = StrapiPrimitive | StrapiQueryValue[] | StrapiQueryParams;

export interface StrapiFetchOptions {
  params?: StrapiQueryParams;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  headers?: HeadersInit;
}

const DEFAULT_BASE_URL = 'http://localhost:1337';

const STRAPI_BASE_URL =
  process.env.STRAPI_BASE_URL ??
  process.env.NEXT_PUBLIC_STRAPI_URL ??
  DEFAULT_BASE_URL;

const STRAPI_TOKEN =
  process.env.STRAPI_API_TOKEN ?? process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

function buildQuery(params: StrapiQueryParams = {}): string {
  const parts: string[] = [];

  const encode = (key: string, value: StrapiQueryValue) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        encode(`${key}[${index}]`, entry);
      });
      return;
    }

    if (typeof value === 'object') {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        encode(`${key}[${nestedKey}]`, nestedValue);
      });
      return;
    }

    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };

  Object.entries(params).forEach(([key, value]) => encode(key, value));

  return parts.length ? `?${parts.join('&')}` : '';
}

export async function strapiFetch<TResponse>(
  path: string,
  { params, cache, next, headers }: StrapiFetchOptions = {}
): Promise<TResponse> {
  const query = buildQuery(params);
  const url = `${STRAPI_BASE_URL}${path}${query}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers instanceof Headers ? Object.fromEntries(headers.entries()) : Array.isArray(headers) ? Object.fromEntries(headers) : headers ?? {}),
  };

  if (STRAPI_TOKEN) {
    requestHeaders.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  const response = await fetch(url, {
    cache,
    next,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Strapi request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json() as Promise<TResponse>;
}

export function getStrapiAssetUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${STRAPI_BASE_URL}${url}`;
}
