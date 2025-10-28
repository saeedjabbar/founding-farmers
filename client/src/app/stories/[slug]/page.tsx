import { notFound } from 'next/navigation';
import { StoryTimelinePage } from '@/components/StoryTimelinePage';
import { getStoryBySlug, getStories } from '@/lib/strapi/queries';

export const revalidate = 60;

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  return <StoryTimelinePage story={story} />;
}

export async function generateStaticParams() {
  const stories = await getStories();
  return stories.map((story) => ({ slug: story.slug }));
}
