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
  renderAllPages?: boolean;
}

export function PdfViewer({ fileUrl, downloadUrl, title, className, renderAllPages = false }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

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
    setCurrentPage(1);
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
            {renderAllPages
              ? Array.from({ length: numPages }, (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={containerWidth ? Math.min(containerWidth - 32, 960) : undefined}
                    renderAnnotationLayer={false}
                    renderTextLayer
                    className="shadow-sm"
                    loading={null}
                  />
                ))
              : numPages > 0 && (
                  <Page
                    key={`page_${currentPage}`}
                    pageNumber={currentPage}
                    width={containerWidth ? Math.min(containerWidth - 32, 960) : undefined}
                    renderAnnotationLayer={false}
                    renderTextLayer
                    className="shadow-sm"
                    loading={null}
                  />
                )}
          </Document>
        </div>
      </div>

      {numPages > 0 && (
        <div className="flex flex-col gap-2 text-xs theme-text-muted">
          {!renderAllPages && numPages > 1 && (
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 rounded border border-[var(--theme-border)] theme-text-secondary hover:text-[var(--theme-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="tracking-[0.18em] uppercase">
                Page {currentPage} of {numPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(numPages, prev + 1))}
                disabled={currentPage >= numPages}
                className="px-3 py-1 rounded border border-[var(--theme-border)] theme-text-secondary hover:text-[var(--theme-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          <p className="uppercase tracking-[0.2em]">
            {numPages} page{numPages === 1 ? '' : 's'}
            {title ? ` in ${title}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}
