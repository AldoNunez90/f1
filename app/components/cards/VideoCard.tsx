'use client';

import Image from 'next/image';

interface VideoCardProps {
  title: string;
  link: string;
  channelName: string;
  published?: string;
  description?: string;
  thumbnail?: string;
}

export function VideoCard({
  title,
  link,
  channelName,
  published,
  description,
  thumbnail,
}: VideoCardProps) {

  // CONTROL DE ERRORES EN FECHAS:
  // Evita que un formato de fecha no válido rompa el renderizado o muestre "Invalid Date"
  const formattedDate = (() => {
    if (!published) return 'Reciente';
    const date = new Date(published);
    if (isNaN(date.getTime())) return 'Reciente';
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  })();

  return (
    <article className="group relative rounded-3xl border border-gray-200 bg-slate-50 shadow-md transition-all duration-300 hover:translate-y-1 hover:shadow-xl hover:border-cyan-500 dark:border-gray-800 dark:bg-slate-950 flex flex-col h-full overflow-hidden">
      
      {/* Contenedor de la imagen optimizada (CLS & Responsive) */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={`Miniatura del video: ${title}`}
            fill
            // OPTIMIZACIÓN DE RESOLUCIÓN: Le dice a Next.js que sirva la imagen adaptada al tamaño real de la tarjeta
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 font-semibold" aria-hidden="true">
            Video
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* OPTIMIZACIÓN DE CONTRASTE: Cambiamos text-cyan-600 a text-cyan-700 en modo claro */}
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-400">
            {channelName}
          </p>
          
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white line-clamp-2 tracking-tight">
            {title}
          </h2>
          
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">
            {description ? description : 'Último video del canal.'}
          </p>
        </div>

        {/* Enlace y Acción */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <time dateTime={published} className="font-medium">
            {formattedDate}
          </time>
          
          {/* OPTIMIZACIÓN DE ACCESIBILIDAD Y ENLACE SEMÁNTICO:
              Envolvemos solo la llamada final en una etiqueta anchor clara con su respectivo aria-label */}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-cyan-700 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            aria-label={`Ver video: ${title} en YouTube`}
          >
            Ver video <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
}