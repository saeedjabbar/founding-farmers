import { createStrapi } from '@strapi/strapi';

type ColumnInfo = Record<string, unknown>;

function resolveColumn(candidates: string[], columnInfo: ColumnInfo): string | undefined {
  return candidates.find((candidate) => Object.prototype.hasOwnProperty.call(columnInfo, candidate));
}

async function ensureTable(connection: any, tableName: string): Promise<boolean> {
  try {
    return await connection.schema.hasTable(tableName);
  } catch (error) {
    console.error(`[timeline-migrate] Failed checking table "${tableName}":`, error);
    return false;
  }
}

async function migrateLegacyTimelineEntries() {
  const strapi = await createStrapi();
  await strapi.load();

  try {
    const connection = strapi.db.connection;
    const componentTable = 'components_timeline_timeline_entries';
    const joinTable = 'stories_components';
    const recordsJoinTable = 'components_timeline_timeline_entries_records_links';

    const hasComponentTable = await ensureTable(connection, componentTable);
    if (!hasComponentTable) {
      console.info('[timeline-migrate] No legacy component table detected; nothing to migrate.');
      return;
    }

    const hasJoinTable = await ensureTable(connection, joinTable);
    if (!hasJoinTable) {
      console.info('[timeline-migrate] No legacy join table detected; nothing to migrate.');
      return;
    }

    const componentColumnInfo = await connection(componentTable).columnInfo();
    const joinColumnInfo = await connection(joinTable).columnInfo();

    const componentIdColumn =
      resolveColumn(['component_id', 'componentId', 'id'], joinColumnInfo) ?? 'component_id';
    const storyIdColumn =
      resolveColumn(['entity_id', 'entityId', 'story_id', 'storyId'], joinColumnInfo) ?? 'entity_id';
    const orderColumn = resolveColumn(['order', 'order_column', 'orderColumn'], joinColumnInfo) ?? 'order';
    const fieldColumn = resolveColumn(['field', 'field_name', 'fieldName'], joinColumnInfo) ?? 'field';

    const entryDateColumn =
      resolveColumn(['entry_date', 'entryDate'], componentColumnInfo) ?? 'entry_date';
    const headlineColumn =
      resolveColumn(['headline'], componentColumnInfo) ?? 'headline';
    const bodyColumn = resolveColumn(['body'], componentColumnInfo) ?? 'body';

    const orderBy: string[] = [];
    if (joinColumnInfo[storyIdColumn]) {
      orderBy.push(storyIdColumn);
    }
    if (joinColumnInfo[orderColumn]) {
      orderBy.push(orderColumn);
    }

    const joinRowsQuery = connection(joinTable).where(fieldColumn, 'timelineEntries');
    if (orderBy.length > 0) {
      orderBy.forEach((column) => joinRowsQuery.orderBy(column));
    }
    const joinRows = await joinRowsQuery;

    if (joinRows.length === 0) {
      console.info('[timeline-migrate] No legacy timeline component links to migrate.');
      return;
    }

    const legacyComponents = await connection(componentTable);
    const componentById = new Map<number | string, any>();
    for (const componentRow of legacyComponents) {
      componentById.set(componentRow.id, componentRow);
    }

    let recordLinks: Array<{ component_id: number | string; record_id: number | string }> = [];
    if (await ensureTable(connection, recordsJoinTable)) {
      recordLinks = await connection(recordsJoinTable);
    }

    const recordsColumnInfo =
      recordLinks.length > 0 ? await connection(recordsJoinTable).columnInfo() : undefined;
    const recordsComponentIdColumn =
      recordsColumnInfo &&
      (resolveColumn(['component_id', 'componentId'], recordsColumnInfo) ?? 'component_id');
    const recordIdColumn =
      recordsColumnInfo &&
      (resolveColumn(['record_id', 'recordId', 'api::record.record_id'], recordsColumnInfo) ?? 'record_id');

    const existingTimelineCounts = new Map<number | string, number>();

    for (const link of joinRows) {
      const componentId = link[componentIdColumn];
      const storyId = link[storyIdColumn];

      if (!componentById.has(componentId)) {
        console.warn(
          `[timeline-migrate] Legacy component ${componentId} referenced by story ${storyId} is missing; skipping.`
        );
        continue;
      }

      const alreadyMigratedCount =
        existingTimelineCounts.get(storyId) ??
        (await strapi.entityService.count('api::timeline-entry.timeline-entry', {
          filters: { story: { id: storyId } },
        }));
      existingTimelineCounts.set(storyId, alreadyMigratedCount);

      if (alreadyMigratedCount > 0) {
        // Skip migration for stories that already have timeline entries to avoid duplicates.
        continue;
      }

      const componentRow = componentById.get(componentId);
      const entryDate = componentRow[entryDateColumn];
      const headline = componentRow[headlineColumn];
      const body = componentRow[bodyColumn];
      const rawOrder = link[orderColumn];
      const parsedOrder =
        typeof rawOrder === 'number'
          ? rawOrder
          : Number.parseInt(rawOrder ?? '0', 10);

      let parsedBody: unknown = body;
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body);
        } catch (error) {
          console.warn(
            `[timeline-migrate] Failed to parse Blocks JSON for component ${componentId}; leaving as string.`,
            error
          );
        }
      }

      const normalizedBody = Array.isArray(parsedBody) ? parsedBody : [];
      if (!Array.isArray(parsedBody)) {
        console.warn(
          `[timeline-migrate] Timeline component ${componentId} has non-array body; defaulting to empty array.`
        );
      }

      let relatedRecords: Array<number | string> | undefined;
      if (recordLinks.length > 0 && recordsComponentIdColumn && recordIdColumn) {
        relatedRecords = recordLinks
          .filter((relation) => relation[recordsComponentIdColumn] === componentId)
          .map((relation) => relation[recordIdColumn])
          .filter((value) => value !== null && value !== undefined);
      }

      await strapi.entityService.create(
        'api::timeline-entry.timeline-entry',
        {
          data: {
            entryDate,
            headline,
            body: normalizedBody,
            position: Number.isFinite(parsedOrder) ? parsedOrder : 0,
            story: storyId,
            ...(relatedRecords && relatedRecords.length > 0
              ? { records: { connect: relatedRecords.map((id) => ({ id })) } }
              : {}),
          },
        } as any
      );
    }

    console.info('[timeline-migrate] Migration completed. Verify data before dropping legacy tables.');
  } finally {
    await strapi.destroy();
  }
}

migrateLegacyTimelineEntries().catch((error) => {
  console.error('[timeline-migrate] Unexpected error during migration:', error);
  process.exitCode = 1;
});
