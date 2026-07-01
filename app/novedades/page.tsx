import { fetchLatMotorsportRssItems } from '@/lib/services/rssService';

function formatNewsDate(dateString?: string) {
  if (!dateString) return 'Reciente';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Reciente';

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function sanitizeDescription(description?: string) {
  if (!description) return 'Ver noticia completa en Motorsport LAT.';
  return description.replace(/<[^>]+>/g, '').trim();
}

export default async function NovedadesPage() {
  const news = await fetchLatMotorsportRssItems(3);

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="max-w-6xl mx-auto rounded-3xl bg-white dark:bg-gray-900 p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Novedades</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">Últimas noticias de Motorsport LAT</h1>
          </div>
          <p className="max-w-xl text-gray-600 dark:text-gray-300">
            Las últimas tres publicaciones extraídas directamente del RSS para que siempre veas lo más reciente.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {news.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:border-cyan-400 dark:border-gray-800 dark:bg-slate-950"
            >
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{item.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {sanitizeDescription(item.description).slice(0, 140)}
                    {item.description && item.description.length > 140 ? '...' : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>{formatNewsDate(item.pubDate)}</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">Ver en Motorsport →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
