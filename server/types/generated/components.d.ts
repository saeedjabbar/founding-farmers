import type { Schema, Struct } from '@strapi/strapi';

export interface MediaVideoEmbed extends Struct.ComponentSchema {
  collectionName: 'components_media_video_embeds';
  info: {
    description: 'Stores iframe embed markup for externally hosted videos';
    displayName: 'Video Embed';
  };
  attributes: {
    aspectRatio: Schema.Attribute.Enumeration<['16:9', '4:3', '1:1', '9:16']> &
      Schema.Attribute.DefaultTo<'16:9'>;
    embedHtml: Schema.Attribute.Text & Schema.Attribute.Required;
    provider: Schema.Attribute.Enumeration<['youtube', 'vimeo', 'other']> &
      Schema.Attribute.DefaultTo<'other'>;
    title: Schema.Attribute.String;
  };
}

export interface StorySummaryCard extends Struct.ComponentSchema {
  collectionName: 'components_story_summary_cards';
  info: {
    description: 'Optional story summary containing narrative and bullet highlights';
    displayName: 'Summary Card';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
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
    body: Schema.Attribute.Blocks & Schema.Attribute.Required;
    entryDate: Schema.Attribute.Date & Schema.Attribute.Required;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    records: Schema.Attribute.Relation<'manyToMany', 'api::record.record'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'media.video-embed': MediaVideoEmbed;
      'story.summary-card': StorySummaryCard;
      'timeline.timeline-entry': TimelineTimelineEntry;
    }
  }
}
