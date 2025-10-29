import { notFound } from 'next/navigation';
import { RecordDetailPage } from '@/components/RecordDetailPage';
import { getAllRecords, getRecordBySlug, getStoriesFeaturingRecord } from '@/lib/strapi/queries';

export const revalidate = 60;

interface RecordPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecordPage({ params }: RecordPageProps) {
  const { slug } = await params;
  const record = await getRecordBySlug(slug);
  if (!record) {
    notFound();
  }

  const featuredIn = await getStoriesFeaturingRecord(slug);

  return <RecordDetailPage record={record} featuredIn={featuredIn} />;
}

export async function generateStaticParams() {
  const records = await getAllRecords();
  return records.map((record) => ({ slug: record.slug }));
}
