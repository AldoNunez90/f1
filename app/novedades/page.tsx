import { fetchLatestNewsItems } from '@/lib/services/rssService';
import { fetchLatestVideos } from '@/lib/services/videoService';
import { VideoCard } from '@/app/components/cards/VideoCard';
import Image from 'next/image';

const NEWS_PAGE_LIMIT = 24;

interface NewsItem {
  title: string;
  link: string;
  img?: string;
  source?: string;
  description?: string;
  pubDate?: string;
}

interface VideoItem {
  channelId: string;
  title: string;
  link: string;
  channelName: string;
  published?: string;
  thumbnail?: string;
}

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
  // Peticiones paralelas en el back de forma segura
  const [newsData, videosData] = await Promise.all([
    fetchLatestNewsItems(NEWS_PAGE_LIMIT),
    fetchLatestVideos()
  ]);

  const news: NewsItem[] = Array.isArray(newsData) ? newsData : [];
  const videos: VideoItem[] = Array.isArray(videosData) ? videosData : [];

  return (
    <div className="space-y-8 md:py-8 sm:px-6 lg:px-8">
      
      {/* Sección Noticias */}
      <section className="max-w-6xl mx-auto rounded-3xl bg-white dark:bg-gray-900 p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            {/* OPTIMIZACIÓN CONTRASTE: text-cyan-600 a text-cyan-700 en modo claro */}
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-400">Novedades</p>
            <h1 className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Últimas noticias de Fórmula 1
            </h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => {
            const cleanDescription = sanitizeDescription(item.description);
            const truncatedDescription = cleanDescription.slice(0, 140) + (cleanDescription.length > 140 ? '...' : '');
            
            return (
              <article 
                key={item.link} 
                className="group relative rounded-3xl border border-gray-200 bg-slate-50 shadow-md transition-all duration-300 hover:translate-y-1 hover:shadow-xl hover:border-cyan-500 dark:border-gray-800 dark:bg-slate-950 flex flex-col justify-between h-full overflow-hidden"
              >
                <div>
                  {/* Contenedor de la imagen de noticias (Con dimensiones reservadas CLS) */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-200 dark:bg-gray-800">
                    <Image
                      alt={`Imagen de la noticia: ${item.title}`}
                      src={item.img || '/landingImgAlfaRomeo.webp'} 
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-103"
                    />
                  </div>

                  <div className="p-6">
                    <div className="mb-3 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300">
                      {item.source ?? 'Fuente'}
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white line-clamp-2 tracking-tight">
                      {item.title}
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">
                      {truncatedDescription}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 mt-auto">
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{formatNewsDate(item.pubDate)}</span>
                    <a 
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-cyan-700 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                      aria-label={`Ver noticia completa: ${item.title}`}
                    >
                      Ver noticia <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Sección Videos */}
      <section id="videos" className="max-w-6xl mx-auto rounded-3xl bg-white dark:bg-gray-900 p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-400">Últimos videos</p>
            <h2 className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Canales con data en español</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl font-medium">
              Último video de cada canal, actualizado desde el feed de YouTube.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard
              key={video.channelId}
              title={video.title}
              link={video.link}
              channelName={video.channelName}
              published={video.published}
              thumbnail={video.thumbnail}
            />
          ))}
        </div>
      </section>
    </div>
  );
}