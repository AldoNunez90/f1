'use client';

import { useState } from 'react';
import { EngineModal } from './EngineModal';

interface EngineTriggerProps {
  engineId?: string;
  engineName?: string;
}

export function EngineTrigger({ engineId, engineName }: EngineTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!engineId) {
    return <span>{engineName || 'N/D'}</span>;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hover:underline hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer flex items-center gap-1 font-bold text-left"
        title="Ver especificaciones del motor"
      >
        <span>{engineName || 'N/D'}</span>
        <span className="text-[10px] text-cyan-500 opacity-70">🔍</span>
      </button>

      {isOpen && (
        <EngineModal
          engineId={engineId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}