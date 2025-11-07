import { ensureBlocks } from '../../utils/searchableContent';

interface LifecycleEventWithData {
  params: {
    data?: Record<string, unknown>;
  };
  result?: Record<string, unknown> | Record<string, unknown>[];
}

const normalizeData = (data: Record<string, unknown> | undefined) => {
  if (!data) {
    return;
  }

  const current = (data as { searchableContent?: unknown }).searchableContent;
  const nextValue = ensureBlocks(current);
  (data as { searchableContent?: unknown }).searchableContent = nextValue ?? null;
};

const normalizeEntity = (entity: Record<string, unknown> | null | undefined) => {
  if (!entity) {
    return;
  }

  const current = (entity as { searchableContent?: unknown }).searchableContent;
  const nextValue = ensureBlocks(current);
  (entity as { searchableContent?: unknown }).searchableContent = nextValue ?? null;
};

const normalizeMany = (entities: unknown) => {
  if (Array.isArray(entities)) {
    entities.forEach((entity) => {
      if (entity && typeof entity === 'object') {
        normalizeEntity(entity as Record<string, unknown>);
      }
    });
  } else if (entities && typeof entities === 'object') {
    normalizeEntity(entities as Record<string, unknown>);
  }
};

export default {
  beforeCreate(event: LifecycleEventWithData) {
    normalizeData(event.params.data);
  },
  beforeUpdate(event: LifecycleEventWithData) {
    normalizeData(event.params.data);
  },
  afterCreate(event: LifecycleEventWithData) {
    normalizeEntity(event.result as Record<string, unknown>);
  },
  afterUpdate(event: LifecycleEventWithData) {
    normalizeEntity(event.result as Record<string, unknown>);
  },
  afterFindOne(event: LifecycleEventWithData) {
    normalizeEntity(event.result as Record<string, unknown>);
  },
  afterFindMany(event: LifecycleEventWithData) {
    normalizeMany(event.result);
  },
};
