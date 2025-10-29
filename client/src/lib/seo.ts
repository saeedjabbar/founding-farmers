import type { Metadata } from 'next';
import type { SeoMetadata, StrapiMedia } from './strapi/types';

interface MetadataImageFallback {
  url: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

interface MetadataFallback {
  title?: string;
  description?: string;
  path?: string;
  image?: MetadataImageFallback;
}

let cachedBaseUrl: URL | null | undefined;

function parseUrl(value?: string | null): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    try {
      return new URL(`https://${value}`);
    } catch {
      return null;
    }
  }
}

export function getSiteBaseUrl(): URL | null {
  if (cachedBaseUrl !== undefined) {
    return cachedBaseUrl;
  }

  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_WEBSITE_URL,
    process.env.WEBSITE_URL,
  ];

  for (const candidate of candidates) {
    const parsed = parseUrl(candidate);
    if (parsed) {
      cachedBaseUrl = parsed;
      return parsed;
    }
  }

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  const vercelUrl = vercel ? (vercel.startsWith('http') ? vercel : `https://${vercel}`) : undefined;
  const parsedVercel = parseUrl(vercelUrl);
  if (parsedVercel) {
    cachedBaseUrl = parsedVercel;
    return parsedVercel;
  }

  cachedBaseUrl = null;
  return cachedBaseUrl;
}

type ImageCandidate =
  | StrapiMedia
  | MetadataImageFallback
  | null
  | undefined;

const SUPPORTED_OPEN_GRAPH_TYPES = [
  'website',
  'article',
  'book',
  'profile',
  'music.song',
  'music.album',
  'music.playlist',
  'music.radio_station',
  'video.movie',
  'video.episode',
  'video.tv_show',
  'video.other',
] as const;

type SupportedOpenGraphType = (typeof SUPPORTED_OPEN_GRAPH_TYPES)[number];

function isSupportedOpenGraphType(value: string): value is SupportedOpenGraphType {
  return SUPPORTED_OPEN_GRAPH_TYPES.some((candidate) => candidate === value);
}

function normalizeOpenGraphType(
  value: string | null | undefined,
  fallback: SupportedOpenGraphType
): SupportedOpenGraphType {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return isSupportedOpenGraphType(normalized) ? normalized : fallback;
}

function normalizeImage(candidate: ImageCandidate): { url: string; width?: number; height?: number; alt?: string } | undefined {
  if (!candidate) return undefined;
  if (!('url' in candidate) || !candidate.url) return undefined;

  const width =
    'width' in candidate && typeof candidate.width === 'number'
      ? candidate.width
      : undefined;
  const height =
    'height' in candidate && typeof candidate.height === 'number'
      ? candidate.height
      : undefined;
  const alt =
    'alternativeText' in candidate && candidate.alternativeText
      ? candidate.alternativeText
      : 'alt' in candidate && candidate.alt
        ? candidate.alt
        : undefined;

  return {
    url: candidate.url,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(alt ? { alt } : {}),
  };
}

function dedupeImages(images: Array<{ url: string; width?: number; height?: number; alt?: string }>): Array<{ url: string; width?: number; height?: number; alt?: string }> {
  const seen = new Set<string>();
  return images.filter((image) => {
    const key = image.url;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function createPageMetadata(
  seo: SeoMetadata | null | undefined,
  fallback: MetadataFallback = {}
): Metadata {
  const baseUrl = getSiteBaseUrl();
  const defaultTitle = fallback.title ?? 'The Chronicle Timeline';
  const title = seo?.metaTitle?.trim().length ? seo.metaTitle.trim() : defaultTitle;
  const description =
    seo?.metaDescription?.trim().length ? seo.metaDescription.trim() : (fallback.description ?? 'Investigative timeline experience with dynamic themes and storytelling.');

  const canonical = seo?.canonicalURL?.trim().length
    ? seo.canonicalURL.trim()
    : fallback.path && baseUrl
      ? new URL(fallback.path, baseUrl).toString()
      : undefined;

  const primaryImageCandidates: ImageCandidate[] = [
    seo?.openGraph?.image,
    seo?.metaImage ?? undefined,
    fallback.image,
  ];

  const images = dedupeImages(
    primaryImageCandidates
      .map((candidate) => normalizeImage(candidate))
      .filter((candidate): candidate is { url: string; width?: number; height?: number; alt?: string } => Boolean(candidate))
  );

  const defaultOpenGraphType: SupportedOpenGraphType = fallback.path ? 'article' : 'website';
  const openGraphType = normalizeOpenGraphType(seo?.openGraph?.type, defaultOpenGraphType);
  const openGraphUrl = seo?.openGraph?.url ?? canonical;

  const metadata: Metadata = {
    title,
    description,
  };

  if (canonical) {
    metadata.alternates = { canonical };
  }

  if (seo?.keywords && seo.keywords.length > 0) {
    metadata.keywords = seo.keywords;
  }

  if (seo?.metaRobots && seo.metaRobots.length > 0) {
    metadata.robots = seo.metaRobots.join(', ');
  }

  if (seo?.metaViewport?.trim().length) {
    metadata.viewport = seo.metaViewport.trim();
  }

  if (seo?.openGraph || images.length > 0 || openGraphUrl) {
    metadata.openGraph = {
      title: seo?.openGraph?.title ?? title,
      description: seo?.openGraph?.description ?? description,
      type: openGraphType,
      ...(openGraphUrl ? { url: openGraphUrl } : {}),
      ...(images.length > 0 ? { images } : {}),
    };
  }

  metadata.twitter = {
    card: images.length > 0 ? 'summary_large_image' : 'summary',
    title,
    description,
    ...(images.length > 0
      ? { images: images.map((image) => ({ url: image.url, alt: image.alt })) }
      : {}),
  };

  return metadata;
}

export function serializeStructuredData(structuredData: unknown): string | null {
  if (structuredData === null || structuredData === undefined) {
    return null;
  }

  if (typeof structuredData === 'string') {
    const trimmed = structuredData.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  try {
    return JSON.stringify(structuredData);
  } catch {
    return null;
  }
}
