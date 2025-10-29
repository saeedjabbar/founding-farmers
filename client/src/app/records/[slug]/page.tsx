import { notFound } from 'next/navigation';
import { RecordDetailPage } from '@/components/RecordDetailPage';
import { getAllRecords, getRecordBySlug } from '@/lib/strapi/queries';

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

  return <RecordDetailPage record={record} />;
}

export async function generateStaticParams() {
  const records = await getAllRecords();
  return records.map((record) => ({ slug: record.slug }));
}
