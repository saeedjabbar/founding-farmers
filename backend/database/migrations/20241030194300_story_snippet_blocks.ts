import type { Knex } from 'knex';

const STORY_TABLE = 'stories';

type BlockChild = {
  type: string;
  text: string;
};

type BlockNode = {
  type: string;
  children: BlockChild[];
};

function toBlocks(value?: string | null): BlockNode[] | null {
  if (!value) {
    return null;
  }

  const paragraphs = value
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  if (!paragraphs.length) {
    return null;
  }

  return paragraphs.map<BlockNode>((paragraph) => ({
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: paragraph,
      },
    ],
  }));
}

export async function up(knex: Knex) {
  const hasStorySnippet = await knex.schema.hasColumn(STORY_TABLE, 'story_snippet');
  if (hasStorySnippet) {
    return;
  }

  await knex.schema.alterTable(STORY_TABLE, (table) => {
    table.jsonb('story_snippet');
    table.jsonb('story_blurb');
  });

  const existingStories = await knex(STORY_TABLE).select('id', 'blurb');

  for (const story of existingStories) {
    const snippetBlocks = toBlocks(typeof story.blurb === 'string' ? story.blurb : null);

    await knex(STORY_TABLE)
      .where({ id: story.id })
      .update({
        story_snippet: snippetBlocks ?? null,
        story_blurb: null,
      });
  }
}

export async function down(knex: Knex) {
  const hasStorySnippet = await knex.schema.hasColumn(STORY_TABLE, 'story_snippet');
  if (!hasStorySnippet) {
    return;
  }

  await knex.schema.alterTable(STORY_TABLE, (table) => {
    table.dropColumn('story_snippet');
    table.dropColumn('story_blurb');
  });
}
