'use client';

interface DocumentCardProps {
  title: string;
  summary: string;
  spanishSummary: string;
  pageCount?: number;
  lastFetched: string;
  url: string;
}

export function DocumentCard({
  title,
  summary,
  spanishSummary,
  pageCount,
  lastFetched,
  url,
}: DocumentCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-3xl border border-gray-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:border-cyan-400 dark:border-gray-800 dark:bg-slate-950"
    >
      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-600">Documentos FIA</p>
        <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>

        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <p>{summary.slice(0, 160)}{summary.length > 160 ? '...' : ''}</p>
          <p className="text-slate-500 dark:text-slate-400">{spanishSummary.slice(0, 140)}{spanishSummary.length > 140 ? '...' : ''}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>{pageCount ? `${pageCount} páginas` : 'Páginas indefinidas'}</span>
          <span>{new Date(lastFetched).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </a>
  );
}
