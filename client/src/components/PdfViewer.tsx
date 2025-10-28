'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import '@/lib/polyfills/promiseWithResolvers';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';

const PDF_WORKER_SRC = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

if (typeof window !== 'undefined' && pdfjs.GlobalWorkerOptions.workerSrc !== PDF_WORKER_SRC) {
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
}

export interface PdfViewerProps {
  fileUrl: string;
  downloadUrl?: string;
  title?: string;
  className?: string;
}

export function PdfViewer({ fileUrl, downloadUrl, title, className }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [numPages, setNumPages] = useState<number>(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (!entry) return;
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const documentError = useMemo(
    () => (
      <div className="p-6 text-sm theme-text-secondary">
        Could not load document preview.
        {downloadUrl && (
          <>
            {' '}
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="theme-accent hover:underline">
              Download the document
            </a>
            .
          </>
        )}
      </div>
    ),
    [downloadUrl],
  );

  const documentLoading = useMemo(
    () => (
      <div className="p-6 text-sm theme-text-secondary">
        Loading document&hellip;
      </div>
    ),
    [],
  );

  const handleLoadSuccess = (doc: PDFDocumentProxy) => {
    setNumPages(doc.numPages);
  };

  const documentOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    [],
  );

  return (
    <div className={clsx('space-y-4', className)}>
      <div
        ref={containerRef}
        className="relative w-full rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] overflow-hidden"
      >
        <div className="max-h-[640px] overflow-y-auto">
          <Document
            file={fileUrl}
            onLoadSuccess={handleLoadSuccess}
            error={documentError}
            loading={documentLoading}
            className="flex flex-col items-center gap-6 py-6 px-4"
            options={documentOptions}
          >
            {Array.from({ length: numPages }, (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={containerWidth ? Math.min(containerWidth - 32, 960) : undefined}
                renderAnnotationLayer={false}
                renderTextLayer
                className="shadow-sm"
                loading={null}
              />
            ))}
          </Document>
        </div>
      </div>

      {numPages > 0 && (
        <p className="text-xs uppercase tracking-[0.2em] theme-text-muted">
          {numPages} page{numPages === 1 ? '' : 's'}
          {title ? ` in ${title}` : ''}
        </p>
      )}
    </div>
  );
}
