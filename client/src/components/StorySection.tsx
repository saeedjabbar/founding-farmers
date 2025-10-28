import { motion } from 'motion/react';
import type { BlocksContent } from '@strapi/blocks-react-renderer';
import { StrapiRichText } from '@/components/StrapiRichText';

interface StorySectionProps {
  id: string;
  title: string;
  body: BlocksContent;
}

export function StorySection({ id, title, body }: StorySectionProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="space-y-3 story-content"
    >
      <h2 className="theme-text-primary text-lg">{title}</h2>
      <StrapiRichText content={body} className="theme-text-secondary story-content text-sm" />
    </motion.div>
  );
}
