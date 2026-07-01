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
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-3xl border border-gray-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:border-cyan-400 dark:border-gray-800 dark:bg-slate-950"
    >
      {thumbnail ? (
        <div className="relative h-56 w-full overflow-hidden bg-slate-200">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center bg-slate-200 text-slate-500 dark:bg-slate-800">
          <span className="text-lg font-semibold">Video</span>
        </div>
      )}

      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-600">{channelName}</p>
        <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description ? description.slice(0, 120) : 'Último video del canal.'}
          {description && description.length > 120 ? '...' : ''}
        </p>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{published ? new Date(published).toLocaleDateString('es-AR', {day: '2-digit', month: 'short', year: 'numeric'}) : 'Reciente'}</span>
          <span className="font-semibold text-cyan-600 dark:text-cyan-400">Ver video →</span>
        </div>
      </div>
    </a>
  );
}
