'use client';

export function resolveStrapiAssetUrl(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const publicBase =
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:1337`
      : '');

  if (!publicBase) {
    return trimmed;
  }

  try {
    return new URL(trimmed, publicBase).toString();
  } catch {
    const base = publicBase.endsWith('/') ? publicBase.slice(0, -1) : publicBase;
    const relative = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return `${base}/${relative}`;
  }
}
