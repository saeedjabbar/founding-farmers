import { useState } from 'react';
import { ChevronDown, FileText, Image as ImageIcon, Mic, File } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SourceCardProps {
  title: string;
  summary: string;
  type: 'pdf' | 'photo' | 'audio' | 'document';
  content?: string;
  url?: string;
}

const iconMap = {
  pdf: FileText,
  photo: ImageIcon,
  audio: Mic,
  document: File,
};

export function SourceCard({ title, summary, type, content, url }: SourceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = iconMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="theme-border theme-surface border rounded-lg shadow-sm overflow-hidden source-content source-card"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-start gap-3 transition-colors text-left hover:opacity-90"
      >
        <Icon className="w-4 h-4 theme-text-secondary mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm theme-text-primary">{title}</h4>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 theme-text-muted flex-shrink-0" />
            </motion.div>
          </div>
          <p className="text-xs theme-text-muted mt-1">{summary}</p>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="theme-border border-t"
          >
            <div className="px-4 py-3 theme-bg">
              {content && <p className="text-xs theme-text-secondary mb-3">{content}</p>}
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs theme-accent hover:underline"
                >
                  View Source →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
