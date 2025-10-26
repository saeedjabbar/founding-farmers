import type { Schema, Struct } from '@strapi/strapi';

export interface TimelineTimelineEntry extends Struct.ComponentSchema {
  collectionName: 'components_timeline_timeline_entries';
  info: {
    description: 'Milestone within a story timeline with linked source records';
    displayName: 'Timeline Entry';
  };
  attributes: {
    body: Schema.Attribute.RichText & Schema.Attribute.Required;
    entryDate: Schema.Attribute.Date & Schema.Attribute.Required;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    records: Schema.Attribute.Relation<'manyToMany', 'api::record.record'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'timeline.timeline-entry': TimelineTimelineEntry;
    }
  }
}
