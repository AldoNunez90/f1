'use client';

import { MouseEvent } from 'react';
import type { DocumentSummary } from './DocumentsViewer';

interface DocumentModalProps {
  document: DocumentSummary | null;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  if (!document) return null;

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Documento ${document.title}`}
      onClick={onClose}
    >
      <div
        className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800"
        onClick={stopPropagation}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-600">Documento FIA</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{document.title}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {document.pageCount ? `${document.pageCount} páginas` : 'Páginas indefinidas'} · {new Date(document.lastFetched).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 text-sm leading-7 text-slate-700 dark:text-slate-300">
          <section className="space-y-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Texto completo del PDF</p>
              <p className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {document.fullText || document.summary}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Resumen en español</p>
              <p className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {document.spanishSummary}
              </p>
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <a
            href={document.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            Descargar PDF original
          </a>
          <span className="text-sm text-slate-500 dark:text-slate-400">Abre el archivo oficial en una nueva pestaña.</span>
        </div>
      </div>
    </div>
  );
}
