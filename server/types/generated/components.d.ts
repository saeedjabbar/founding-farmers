import type { Schema, Struct } from '@strapi/strapi';

export interface StorySummaryCard extends Struct.ComponentSchema {
  collectionName: 'components_story_summary_cards';
  info: {
    description: 'Optional story summary containing narrative and bullet highlights';
    displayName: 'Summary Card';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    bulletsText: Schema.Attribute.Text & Schema.Attribute.DefaultTo<''>;
    heading: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Summary'>;
  };
}

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
      'story.summary-card': StorySummaryCard;
      'timeline.timeline-entry': TimelineTimelineEntry;
    }
  }
}
