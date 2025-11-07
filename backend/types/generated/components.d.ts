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

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_open_graphs';
  info: {
    displayName: 'openGraph';
    icon: 'project-diagram';
  };
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.String;
    ogUrl: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    openGraph: Schema.Attribute.Component<'shared.open-graph', false>;
    structuredData: Schema.Attribute.JSON;
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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'media.video-embed': MediaVideoEmbed;
      'shared.open-graph': SharedOpenGraph;
      'shared.seo': SharedSeo;
      'story.summary-card': StorySummaryCard;
    }
  }
}
