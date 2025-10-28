import type { BlocksContent } from '@strapi/blocks-react-renderer';

type BlocksNode = any;

function walkNodes(
  nodes: BlocksNode[] | undefined | null,
  onText: (text: string) => void,
  onImage: () => void
) {
  if (!nodes) return;

  for (const node of nodes) {
    if (!node) continue;

    if (node.type === 'text' && typeof (node as { text?: unknown }).text === 'string') {
      onText((node as { text: string }).text);
    }

    if (node.type === 'image') {
      onImage();
    }

    if ('children' in node && Array.isArray(node.children)) {
      walkNodes(node.children as BlocksNode[], onText, onImage);
    }
  }
}

export function blocksToPlainText(content?: BlocksContent | null): string {
  if (!content || content.length === 0) {
    return '';
  }

  const parts: string[] = [];
  walkNodes(
    content as BlocksNode[],
    (text) => {
      if (text.trim().length > 0) {
        parts.push(text);
      }
    },
    () => {}
  );

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function hasBlocksContent(content?: BlocksContent | null): content is BlocksContent {
  if (!content || content.length === 0) {
    return false;
  }

  let hasImage = false;
  const text = blocksToPlainText(content);

  if (text.length > 0) {
    return true;
  }

  walkNodes(
    content as BlocksNode[],
    () => {},
    () => {
      hasImage = true;
    }
  );

  return hasImage;
}
