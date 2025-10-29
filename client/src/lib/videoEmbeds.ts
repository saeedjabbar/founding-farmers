import type {
  VideoAspectRatio,
  VideoEmbed,
  VideoEmbedDocument,
  VideoIframeAttributes,
  VideoProvider,
} from '@/lib/strapi/types';

const ATTRIBUTE_REGEX =
  /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const DEFAULT_ASPECT_RATIO: VideoAspectRatio = '16:9';
const DEFAULT_PROVIDER: VideoProvider = 'other';
const TRUSTED_PROTOCOLS = new Set(['https:', 'http:']);
const VALID_REFERRER_POLICIES: VideoIframeAttributes['referrerPolicy'][] = [
  'no-referrer',
  'no-referrer-when-downgrade',
  'origin',
  'origin-when-cross-origin',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
  'unsafe-url',
];
const VALID_LOADING_VALUES: VideoIframeAttributes['loading'][] = ['lazy', 'eager'];

interface ParsedIframeResult extends VideoIframeAttributes {
  title?: string;
}

function normalizeSrc(rawSrc: string): string | null {
  let normalized = rawSrc.trim();
  if (!normalized) {
    return null;
  }

  if (normalized.startsWith('//')) {
    normalized = `https:${normalized}`;
  }

  try {
    const url = new URL(normalized);
    if (!TRUSTED_PROTOCOLS.has(url.protocol)) {
      return null;
    }
    if (url.protocol === 'http:') {
      // Force HTTPS to avoid mixed-content issues
      url.protocol = 'https:';
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function parseIframeAttributes(embedHtml: string): ParsedIframeResult | null {
  if (!embedHtml) return null;
  const iframeMatch = embedHtml.match(/<iframe\b([^>]*)>/i);
  if (!iframeMatch) {
    return null;
  }

  const attributes: Record<string, string | true> = {};
  const attributeString = iframeMatch[1] ?? '';
  let match: RegExpExecArray | null;
  ATTRIBUTE_REGEX.lastIndex = 0;

  while ((match = ATTRIBUTE_REGEX.exec(attributeString)) !== null) {
    const [, rawName, doubleQuoted, singleQuoted, unquoted] = match;
    const name = rawName.toLowerCase();
    const value = doubleQuoted ?? singleQuoted ?? unquoted;
    attributes[name] = value ?? true;
  }

  const srcValue = attributes.src;
  if (typeof srcValue !== 'string') {
    return null;
  }

  const normalizedSrc = normalizeSrc(srcValue);
  if (!normalizedSrc) {
    return null;
  }

  const allow =
    typeof attributes.allow === 'string' && attributes.allow.trim().length > 0
      ? attributes.allow.trim()
      : undefined;
  const titleAttr =
    typeof attributes.title === 'string' && attributes.title.trim().length > 0
      ? attributes.title.trim()
      : undefined;
  const referrerPolicyAttr =
    typeof attributes.referrerpolicy === 'string' ? attributes.referrerpolicy.trim() : undefined;
  const referrerPolicy =
    referrerPolicyAttr && VALID_REFERRER_POLICIES.includes(referrerPolicyAttr as VideoIframeAttributes['referrerPolicy'])
      ? (referrerPolicyAttr as VideoIframeAttributes['referrerPolicy'])
      : undefined;
  const loadingAttr = typeof attributes.loading === 'string' ? attributes.loading.trim() : undefined;
  const loading =
    loadingAttr && VALID_LOADING_VALUES.includes(loadingAttr as VideoIframeAttributes['loading'])
      ? (loadingAttr as VideoIframeAttributes['loading'])
      : undefined;
  const allowFullScreen =
    attributes.allowfullscreen === true ||
    attributes.allowfullscreen === '' ||
    attributes.allowfullscreen === 'true' ||
    'allowfullscreen' in attributes;

  return {
    src: normalizedSrc,
    allow,
    title: titleAttr,
    referrerPolicy,
    loading,
    allowFullScreen,
  };
}

function detectProviderFromUrl(url: string): VideoProvider {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname.endsWith('youtube.com') ||
      hostname.endsWith('youtube-nocookie.com') ||
      hostname.endsWith('youtu.be')
    ) {
      return 'youtube';
    }

    if (hostname.endsWith('vimeo.com') || hostname.endsWith('player.vimeo.com')) {
      return 'vimeo';
    }

    return DEFAULT_PROVIDER;
  } catch {
    return DEFAULT_PROVIDER;
  }
}

function normalizeAspectRatio(value?: string | null): VideoAspectRatio {
  if (!value) return DEFAULT_ASPECT_RATIO;
  switch (value) {
    case '16:9':
    case '4:3':
    case '1:1':
    case '9:16':
      return value;
    default:
      return DEFAULT_ASPECT_RATIO;
  }
}

export function sanitizeVideoEmbed(document?: VideoEmbedDocument | null): VideoEmbed | null {
  if (!document?.embedHtml) {
    return null;
  }

  const trimmedHtml = document.embedHtml.trim();
  if (!trimmedHtml) {
    return null;
  }

  const iframe = parseIframeAttributes(trimmedHtml);
  if (!iframe) {
    return null;
  }

  const provider = document.provider ?? detectProviderFromUrl(iframe.src);
  const title = document.title ?? iframe.title ?? undefined;

  return {
    provider,
    title,
    embedHtml: trimmedHtml,
    aspectRatio: normalizeAspectRatio(document.aspectRatio),
    iframe: {
      src: iframe.src,
      allow: iframe.allow,
      referrerPolicy: iframe.referrerPolicy,
      loading: iframe.loading ?? 'lazy',
      allowFullScreen: iframe.allowFullScreen,
    },
  };
}
