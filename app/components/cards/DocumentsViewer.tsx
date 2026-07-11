'use client';

import { useMemo, useState } from 'react';
import { DocumentCard } from './DocumentCard';
import { DocumentModal } from './DocumentModal';

export interface DocumentSummary {
  url: string;
  title: string;
  summary: string;
  spanishSummary: string;
  fullText?: string;
  pageCount?: number;
  lastFetched: string;
}

interface DocumentsViewerProps {
  documents: DocumentSummary[];
}

export function DocumentsViewer({ documents }: DocumentsViewerProps) {
  const [activeDocumentUrl, setActiveDocumentUrl] = useState<string | null>(null);

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.url === activeDocumentUrl) ?? null,
    [activeDocumentUrl, documents]
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {documents.map((doc) => (
          <button
            key={doc.url}
            type="button"
            onClick={() => setActiveDocumentUrl(doc.url)}
            className="text-left"
          >
            <DocumentCard
              url={doc.url}
              title={doc.title}
              summary={doc.summary}
              spanishSummary={doc.spanishSummary}
              pageCount={doc.pageCount}
              lastFetched={doc.lastFetched}
            />
          </button>
        ))}

        <DocumentModal document={activeDocument} onClose={() => setActiveDocumentUrl(null)} />
      </div>
    </>
  );
}
