import { StoryListPage } from '@/components/StoryListPage';
import { getStories } from '@/lib/strapi/queries';

export const revalidate = 120;

export default async function StoriesPage() {
  const stories = await getStories();
  return <StoryListPage stories={stories} />;
}
