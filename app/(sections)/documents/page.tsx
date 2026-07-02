import { DocumentCard } from '@/app/components/cards/DocumentCard';
import { fetchFiaDocumentSummaries, type FiaDocumentSummary } from '@/lib/services/fiaService';

type FiaDocumentSummaryView = Pick<
  FiaDocumentSummary,
  'url' | 'title' | 'summary' | 'spanishSummary' | 'pageCount' | 'lastFetched' | 'publishedAt'
>;

export default async function DocumentsPage() {
  // Traemos los documentos de la base de datos
  const documents: FiaDocumentSummaryView[] = await fetchFiaDocumentSummaries(0);

  // SOLUCIÓN: Ordenamos directamente el array de más reciente a más antiguo
  // Usamos toSorted() para mantener buenas prácticas o [...documents].sort() si tu node es viejo.
  const sortedDocuments = documents.toSorted((a, b) => {
const dateA = a.publishedAt? new Date(a.publishedAt).getTime() : 0;
  const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateA - dateB ; // Recientes primero
  });


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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mapeamos el array que ya está ordenado */}
          {sortedDocuments.map((doc) => (
            <DocumentCard
              key={doc.url}
              url={doc.url}
              title={doc.title}
              summary={doc.summary}
              spanishSummary={doc.spanishSummary}
              pageCount={doc.pageCount}
              lastFetched={doc.lastFetched}
            />
          ))}
        </div>
      </section>
    </div>
  );
}