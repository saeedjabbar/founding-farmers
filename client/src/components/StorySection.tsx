import { motion } from 'motion/react';

interface StorySectionProps {
  id: string;
  title: string;
  body: string;
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
      <div
        className="theme-text-secondary leading-relaxed space-y-3 story-content"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </motion.div>
  );
}
