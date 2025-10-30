import { paragraph, list, type BlocksContent } from '../../../data/blockHelpers';

interface ListBuffer {
  type: 'unordered' | 'ordered';
  items: string[];
}

function flushList(buffer: ListBuffer | null, blocks: BlocksContent): ListBuffer | null {
  if (!buffer || buffer.items.length === 0) {
    return null;
  }

  blocks.push(
    list(
      buffer.items.map((text) => ({
        content: [paragraph(text)],
      })),
      buffer.type === 'ordered' ? 'ordered' : 'unordered'
    )
  );

  return null;
}

export function stringToBlocks(raw?: unknown): BlocksContent | null {
  if (typeof raw !== 'string') {
    return null;
  }

  const sanitized = raw.replace(/\r\n/g, '\n').trimEnd();
  if (sanitized.trim().length === 0) {
    return null;
  }

  const blocks: BlocksContent = [];
  let listBuffer: ListBuffer | null = null;

  const lines = sanitized.split('\n');

  for (const originalLine of lines) {
    const line = originalLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      listBuffer = flushList(listBuffer, blocks);
      blocks.push(paragraph(''));
      continue;
    }

    const unorderedMatch = /^[-*•]\s+(.*)$/.exec(trimmed);
    const orderedMatch = /^(\d+)[\.)]\s+(.*)$/.exec(trimmed);

    if (unorderedMatch) {
      const [, item] = unorderedMatch;
      if (!listBuffer || listBuffer.type !== 'unordered') {
        listBuffer = flushList(listBuffer, blocks);
        listBuffer = { type: 'unordered', items: [] };
      }
      listBuffer.items.push(item.trim());
      continue;
    }

    if (orderedMatch) {
      const [, , item] = orderedMatch;
      if (!listBuffer || listBuffer.type !== 'ordered') {
        listBuffer = flushList(listBuffer, blocks);
        listBuffer = { type: 'ordered', items: [] };
      }
      listBuffer.items.push(item.trim());
      continue;
    }

    listBuffer = flushList(listBuffer, blocks);
    blocks.push(paragraph(line));
  }

  listBuffer = flushList(listBuffer, blocks);

  return blocks.length > 0 ? blocks : null;
}

export function ensureBlocks(value: unknown): BlocksContent | null {
  if (Array.isArray(value)) {
    return value as BlocksContent;
  }

  return stringToBlocks(value);
}
