import { fetchLatestNewsItems } from '@/lib/services/rssService';
import { fetchLatestVideos } from '@/lib/services/videoService';
import { VideoCard } from '@/app/components/cards/VideoCard';
import Image from 'next/image';

const NEWS_PAGE_LIMIT = 24;

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
  if (!description) return 'Ver noticia completa en la fuente original.';
  return description.replace(/<[^>]+>/g, '').trim();
}

export default async function NovedadesPage() {
  const news = await fetchLatestNewsItems(NEWS_PAGE_LIMIT);
  const videos = await fetchLatestVideos();

  return (
    <div className="space-y-8 md:py-8 sm:px-6 lg:px-8">
      <section className="max-w-6xl mx-auto rounded-3xl bg-white dark:bg-gray-900 p-6 md:p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Novedades</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">Últimas noticias de Fórmula 1</h1>
          </div>
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
                <Image
                  alt={item.title}
                  src={item.img || '/landingImgAlfaRomeo.png'}
                  width={300}
                  height={190}
                  className="h-48 w-full rounded-2xl object-cover"
                />
                <div>
                  <div className="mb-3 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                    {item.source ?? 'Fuente'}
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{item.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {sanitizeDescription(item.description).slice(0, 140)}
                    {item.description && item.description.length > 140 ? '...' : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>{formatNewsDate(item.pubDate)}</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">Ver noticia →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="videos" className="max-w-6xl mx-auto rounded-3xl bg-white dark:bg-gray-900 p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Últimos videos</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">Canales con data en español</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">
              Ultimo video de cada canal, actualizado desde el feed de Youtube
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard
              key={video.channelId}
              title={video.title}
              link={video.link}
              channelName={video.channelName}
              published={video.published}
              description={video.description}
              thumbnail={video.thumbnail}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
