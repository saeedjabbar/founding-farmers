import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import clsx from 'clsx';

interface StrapiRichTextProps {
  content?: BlocksContent | null;
  className?: string;
  paragraphClassName?: string;
  listClassName?: string;
}

export function StrapiRichText({
  content,
  className,
  paragraphClassName,
  listClassName,
}: StrapiRichTextProps) {
  if (!content || content.length === 0) {
    return null;
  }

  const paragraphClasses = clsx('leading-relaxed', paragraphClassName);
  const unorderedListClasses = clsx('list-disc pl-5 space-y-2', listClassName);
  const orderedListClasses = clsx('list-decimal pl-5 space-y-2', listClassName);

  return (
    <div className={clsx('space-y-3', className)}>
      <BlocksRenderer
        content={content}
        blocks={{
          paragraph: ({ children }) => <p className={paragraphClasses}>{children}</p>,
          heading: ({ level, children }) => {
            const HeadingTag = `h${Math.min(Math.max(level ?? 3, 1), 6)}` as keyof JSX.IntrinsicElements;
            return <HeadingTag className="font-semibold theme-text-primary">{children}</HeadingTag>;
          },
          list: ({ format, children }) =>
            format === 'ordered' ? (
              <ol className={orderedListClasses}>{children}</ol>
            ) : (
              <ul className={unorderedListClasses}>{children}</ul>
            ),
          quote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--theme-border)] pl-3 italic text-[var(--theme-text-muted)]">
              {children}
            </blockquote>
          ),
          code: ({ children, plainText }) => (
            <pre className="rounded-md bg-[var(--theme-surface-muted)] px-3 py-2 overflow-x-auto text-xs">
              <code>{plainText ?? children}</code>
            </pre>
          ),
          link: ({ children, url }) => (
            <a href={url} target="_blank" rel="noopener noreferrer" className="theme-accent underline underline-offset-2">
              {children}
            </a>
          ),
          image: ({ image }) => (
            <figure className="space-y-2">
              <img
                src={image.url}
                alt={image.alternativeText ?? image.caption ?? image.name}
                className="rounded-md max-h-[360px] w-full object-contain border border-[var(--theme-border)]"
              />
              {(image.caption ?? image.alternativeText) && (
                <figcaption className="text-xs theme-text-muted text-center">
                  {image.caption ?? image.alternativeText}
                </figcaption>
              )}
            </figure>
          ),
        }}
        modifiers={{
          bold: ({ children }) => <strong>{children}</strong>,
          italic: ({ children }) => <em>{children}</em>,
          underline: ({ children }) => <span className="underline">{children}</span>,
          strikethrough: ({ children }) => <span className="line-through">{children}</span>,
          code: ({ children }) => (
            <code className="font-mono text-[0.85em] bg-[var(--theme-surface-muted)] px-1 py-0.5 rounded">
              {children}
            </code>
          ),
        }}
      />
    </div>
  );
}
