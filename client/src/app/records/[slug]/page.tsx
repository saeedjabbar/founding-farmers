import { notFound } from 'next/navigation';
import { RecordDetailPage } from '@/components/RecordDetailPage';
import { getRecordBySlug, getStories } from '@/lib/strapi/queries';

export const revalidate = 60;

interface RecordPageProps {
  params: { slug: string };
}

export default async function RecordPage({ params }: RecordPageProps) {
  const record = await getRecordBySlug(params.slug);
  if (!record) {
    notFound();
  }

  return <RecordDetailPage record={record} />;
}

export async function generateStaticParams() {
  const stories = await getStories();
  const slugs = new Set<string>();

  stories.forEach((story) => {
    story.timelineEntries.forEach((entry) => {
      entry.records.forEach((record) => {
        slugs.add(record.slug);
      });
    });
  });

  return Array.from(slugs).map((slug) => ({ slug }));
}
