const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface ParsedDate {
  date: Date;
  isDateOnly: boolean;
}

export function parseStrapiDate(value?: string | null): ParsedDate | null {
  if (!value) return null;

  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
    const date = new Date(Date.UTC(year, month - 1, day));
    return { date, isDateOnly: true };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return { date: parsed, isDateOnly: false };
}

export function formatStrapiDate(
  value?: string | null,
  formatterOptions?: Intl.DateTimeFormatOptions
): string | null {
  const parsed = parseStrapiDate(value);
  if (!parsed) {
    return value ?? null;
  }

  try {
    const { date, isDateOnly } = parsed;
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(formatterOptions ?? {}),
      ...(isDateOnly ? { timeZone: 'UTC' } : {}),
    }).format(date);
  } catch {
    return value ?? null;
  }
}

export function getIsoDate(value?: string | null): string | null {
  const parsed = parseStrapiDate(value);
  if (!parsed) {
    return value ?? null;
  }

  if (parsed.isDateOnly) {
    return value ?? null;
  }

  return parsed.date.toISOString().split('T')[0];
}
