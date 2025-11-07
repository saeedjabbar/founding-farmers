import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecordDetailPage } from '@/components/RecordDetailPage';
import { getAllRecords, getRecordBySlug, getStoriesFeaturingRecord } from '@/lib/strapi/queries';
import { createPageMetadata, serializeStructuredData } from '@/lib/seo';

export const revalidate = 60;

interface RecordPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RecordPageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = await getRecordBySlug(slug);
  if (!record) {
    return {
      title: 'Record Not Found',
    };
  }

  return createPageMetadata(record.seo, {
    title: record.title,
    description: record.descriptionText ?? undefined,
    path: `/records/${slug}`,
    image: record.mediaAsset
      ? {
          url: record.mediaAsset.url,
          width: record.mediaAsset.width ?? undefined,
          height: record.mediaAsset.height ?? undefined,
          alt: record.mediaAsset.alternativeText ?? record.title,
        }
      : undefined,
  });
}

export default async function RecordPage({ params }: RecordPageProps) {
  const { slug } = await params;
  const record = await getRecordBySlug(slug);
  if (!record) {
    notFound();
  }

  const featuredIn = await getStoriesFeaturingRecord(slug);
  const structuredData = serializeStructuredData(record.seo?.structuredData);

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      )}
      <RecordDetailPage record={record} featuredIn={featuredIn} />
    </>
  );
}

export async function generateStaticParams() {
  const records = await getAllRecords();
  return records.map((record) => ({ slug: record.slug }));
}
