const WHITESPACE_REGEX = /\s+/g;
const SPECIAL_CHARS_REGEX = /[.*+?^${}()|[\]\\]/g;

export function normalizeSearchTerm(value: string): string {
  return value.trim().replace(WHITESPACE_REGEX, ' ');
}

export function createSearchPattern(term: string): string {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) {
    return '';
  }

  const escaped = normalized.replace(SPECIAL_CHARS_REGEX, '\\$&');
  return escaped.replace(WHITESPACE_REGEX, '\\s+');
}

export function createSearchRegex(term: string, { captureGroup = false }: { captureGroup?: boolean } = {}) {
  const pattern = createSearchPattern(term);
  if (!pattern) {
    return null;
  }

  const source = captureGroup ? `(${pattern})` : pattern;
  return new RegExp(source, 'gi');
}

export function normalizeForMatchComparison(value: string): string {
  return value.toLowerCase().replace(WHITESPACE_REGEX, ' ');
}
