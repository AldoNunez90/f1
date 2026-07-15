'use client';

import Image from 'next/image';
import { useState } from 'react';

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
  // Estado local para manejar si la miniatura de alta definición (maxresdefault) falla (404)
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // 1. EXTRAER EL ID DEL VIDEO DE FORMA SEGURA
  const videoId = (() => {
    if (!link) return null;
    const matchStandard = link.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (matchStandard && matchStandard[1]) return matchStandard[1];
    const matchFeed = link.match(/[?&]v=([^&#]+)/);
    if (matchFeed && matchFeed[1]) return matchFeed[1];
    if (link.length === 11) return link;
    return null;
  })();

  // 2. CONSTRUIR URLS DIRECTAS
  const cleanVideoLink = videoId 
    ? `https://www.youtube.com/watch?v=${videoId}` 
    : link;

  // Miniatura de alta resolución (HQ/MaxRes) inicial
  const defaultThumbnail = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
    : thumbnail;

  // Miniatura estándar de respaldo garantizada por Google
  const fallbackThumbnail = videoId 
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : undefined;

  // Inicializamos el estado de la imagen en el render inicial si no ha cambiado por error
  const currentSrc = imgSrc || defaultThumbnail;

  // CONTROL DE ERRORES EN FECHAS
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
      
      {/* Contenedor de la imagen */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        {currentSrc ? (
          <Image
            src={currentSrc}
            alt={`Miniatura del video: ${title}`}
            fill
            unoptimized 
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => {
              if (fallbackThumbnail && currentSrc !== fallbackThumbnail) {
                setImgSrc(fallbackThumbnail);
              }
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 font-semibold" aria-hidden="true">
            Video
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-400">
            {channelName}
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 tracking-tight mt-4">
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
          
          <a
            href={cleanVideoLink}
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