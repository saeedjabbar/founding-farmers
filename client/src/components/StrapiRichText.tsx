import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import clsx from 'clsx';
import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from 'react';

type MarkElement = HTMLElementTagNameMap['mark'];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface HighlightOptions {
  term: string;
  highlightClassName?: string;
  highlightActiveClassName?: string;
  activeHighlightIndex?: number;
  onHighlightMatch?: (index: number, element: MarkElement | null) => void;
}

function createHighlightRenderer(options: HighlightOptions) {
  const {
    term,
    highlightClassName,
    highlightActiveClassName,
    activeHighlightIndex,
    onHighlightMatch,
  } = options;

  const normalizedTerm = term.toLowerCase();
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  let matchIndex = -1;

  const markBaseClass = highlightClassName ?? '';
  const activeClass = highlightActiveClassName ?? '';
  const baseStyles: CSSProperties = highlightClassName
    ? {}
    : {
        color: 'inherit',
        padding: '0 0.1em',
        borderRadius: '0.125rem',
        margin: '0 0.05em',
        boxShadow: '0 -0.35em 0 inset var(--theme-accent)',
      };
  const activeStyles: CSSProperties = {
    backgroundColor: 'var(--theme-accent)',
    color: 'var(--theme-bg)',
    borderBottom: 'none',
  };

  const renderNode = (node: ReactNode, keyPrefix = 'h'): ReactNode => {
    if (typeof node === 'string') {
      return node.split(regex).map((part, index) => {
        if (part.toLowerCase() === normalizedTerm) {
          matchIndex += 1;
          const currentIndex = matchIndex;
          const isActive = activeHighlightIndex === currentIndex;
          const key = `${keyPrefix}-${index}-${currentIndex}`;
          const className = clsx(markBaseClass, isActive && activeClass);
          const style = isActive ? { ...baseStyles, ...activeStyles } : baseStyles;

          return (
            <mark
              key={key}
              className={className}
              data-match-index={currentIndex}
              ref={(element) => onHighlightMatch?.(currentIndex, element)}
              style={style}
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    }

    if (Array.isArray(node)) {
      return node.map((child, index) => renderNode(child, `${keyPrefix}.${index}`));
    }

    if (isValidElement(node) && node.props?.children !== undefined) {
      const highlightedChildren = renderNode(node.props.children, `${keyPrefix}.child`);
      return cloneElement(node, { children: highlightedChildren });
    }

    return node;
  };

  return renderNode;
}

interface StrapiRichTextProps {
  content?: BlocksContent | null;
  className?: string;
  paragraphClassName?: string;
  listClassName?: string;
  highlightTerm?: string;
  highlightClassName?: string;
  highlightActiveClassName?: string;
  activeHighlightIndex?: number;
  onHighlightMatch?: (index: number, element: MarkElement | null) => void;
}

export function StrapiRichText({
  content,
  className,
  paragraphClassName,
  listClassName,
  highlightTerm,
  highlightClassName,
  highlightActiveClassName,
  activeHighlightIndex,
  onHighlightMatch,
}: StrapiRichTextProps) {
  if (!content || content.length === 0) {
    return null;
  }

  const paragraphClasses = clsx('leading-relaxed', paragraphClassName);
  const unorderedListClasses = clsx('list-disc pl-5 space-y-2', listClassName);
  const orderedListClasses = clsx('list-decimal pl-5 space-y-2', listClassName);
  const trimmedHighlight = highlightTerm?.trim();
  const highlight = trimmedHighlight
    ? createHighlightRenderer({
        term: trimmedHighlight,
        highlightClassName,
        highlightActiveClassName,
        activeHighlightIndex,
        onHighlightMatch,
      })
    : undefined;

  return (
    <div className={clsx('space-y-3', className)}>
      <BlocksRenderer
        content={content}
        blocks={{
          paragraph: ({ children }) => (
            <p className={paragraphClasses}>{highlight ? highlight(children) : children}</p>
          ),
          heading: ({ level, children }) => {
            const HeadingTag = `h${Math.min(Math.max(level ?? 3, 1), 6)}` as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag className="font-semibold theme-text-primary">
                {highlight ? highlight(children) : children}
              </HeadingTag>
            );
          },
          list: ({ format, children }) =>
            format === 'ordered' ? (
              <ol className={orderedListClasses}>{highlight ? highlight(children) : children}</ol>
            ) : (
              <ul className={unorderedListClasses}>{highlight ? highlight(children) : children}</ul>
            ),
          quote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--theme-border)] pl-3 italic text-[var(--theme-text-muted)]">
              {highlight ? highlight(children) : children}
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
