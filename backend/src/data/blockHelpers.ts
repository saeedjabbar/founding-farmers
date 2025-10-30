export type TextMarks = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

export type TextSegment = string | ({ text: string } & TextMarks);

export interface TextNode extends TextMarks {
  type: 'text';
  text: string;
}

export interface BlockNode {
  type: string;
  [key: string]: unknown;
}

export type BlocksContent = BlockNode[];

const createTextNode = (segment: TextSegment): TextNode => {
  if (typeof segment === 'string') {
    return { type: 'text', text: segment };
  }

  const { text, ...marks } = segment;
  return {
    type: 'text',
    text,
    ...marks,
  };
};

export const paragraph = (...segments: TextSegment[]): BlockNode => ({
  type: 'paragraph',
  children: segments.map(createTextNode),
});

export const heading = (level: number, text: string, marks: TextMarks = {}): BlockNode => ({
  type: 'heading',
  level,
  children: [createTextNode({ text, ...marks })],
});

export const horizontalRule: BlockNode = { type: 'horizontal-rule' };

export interface ListItemInput {
  content: BlockNode[];
  nestedList?: BlockNode;
}

export const list = (items: ListItemInput[], format: 'unordered' | 'ordered' = 'unordered'): BlockNode => ({
  type: 'list',
  format,
  children: items.map(({ content, nestedList }) => ({
    type: 'list-item',
    children: [
      {
        type: 'list-item-child',
        children: [...content, ...(nestedList ? [nestedList] : [])],
      },
    ],
  })),
});
