import Link from 'next/link';
import { DocumentsViewer } from '@/app/components/cards/DocumentsViewer';
import { fetchFiaDocumentSummaries, type FiaDocumentSummary } from '@/lib/services/fiaService';

type FiaDocumentSummaryView = Pick<
  FiaDocumentSummary,
  'url' | 'title' | 'summary' | 'spanishSummary' | 'pageCount' | 'lastFetched' | 'publishedAt'
>;

interface DocumentsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

const PAGE_SIZE = 10;

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : {};
  const rawPage = resolvedSearchParams.page;
  const requestedPage = Number.parseInt(Array.isArray(rawPage) ? rawPage[0] : rawPage ?? '1', 10);
  const safePage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const skip = (safePage - 1) * PAGE_SIZE;

  const { documents, total }: { documents: FiaDocumentSummaryView[]; total: number } = await fetchFiaDocumentSummaries({
    limit: PAGE_SIZE,
    skip,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(safePage, totalPages);
  const startIndex = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="max-w-6xl mx-auto rounded-3xl bg-white dark:bg-gray-900 p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Documentos FIA</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">Resúmenes automáticos de PDF</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">
              Texto extraído y resumen traducido de los últimos reglamentos oficiales.
            </p>
          </div>
        </div>

        <DocumentsViewer documents={documents} />

        {totalPages > 1 ? (
          <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
            <p>
              Mostrando {startIndex}-{endIndex} de {total} documentos
            </p>
            <div className="flex flex-wrap gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`?page=${currentPage - 1}`}
                  className="rounded-full border border-cyan-600 px-4 py-2 font-medium text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-300 dark:hover:bg-cyan-950"
                >
                  Anterior
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-full border border-gray-300 px-4 py-2 text-gray-400 dark:border-gray-600 dark:text-gray-500">
                  Anterior
                </span>
              )}

              <span className="rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                Página {currentPage} de {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`?page=${currentPage + 1}`}
                  className="rounded-full border border-cyan-600 px-4 py-2 font-medium text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-300 dark:hover:bg-cyan-950"
                >
                  Siguiente
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-full border border-gray-300 px-4 py-2 text-gray-400 dark:border-gray-600 dark:text-gray-500">
                  Siguiente
                </span>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}