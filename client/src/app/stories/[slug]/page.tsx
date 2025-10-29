import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StoryTimelinePage } from '@/components/StoryTimelinePage';
import { getAllStories, getStoryBySlug } from '@/lib/strapi/queries';
import { createPageMetadata, serializeStructuredData } from '@/lib/seo';

export const revalidate = 60;

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) {
    return {
      title: 'Story Not Found',
    };
  }

  return createPageMetadata(story.seo, {
    title: story.title,
    description: story.blurb,
    path: `/stories/${slug}`,
    image: story.heroMedia
      ? {
          url: story.heroMedia.url,
          width: story.heroMedia.width ?? undefined,
          height: story.heroMedia.height ?? undefined,
          alt: story.heroMedia.alternativeText ?? story.title,
        }
      : undefined,
  });
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const structuredData = serializeStructuredData(story.seo?.structuredData);

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      )}
      <StoryTimelinePage story={story} />
    </>
  );
}

export async function generateStaticParams() {
  const stories = await getAllStories();
  return stories.map((story) => ({ slug: story.slug }));
}
