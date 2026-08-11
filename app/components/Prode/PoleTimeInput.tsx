// app/prode/components/PoleTimeInput.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface PoleTimeInputProps {
  initialMs?: number;
  disabled?: boolean;
  onChange: (totalMs: number) => void;
}

export function PoleTimeInput({ initialMs = 0, disabled = false, onChange }: PoleTimeInputProps) {
  // Descomponer milisegundos iniciales
  const initMin = Math.floor(initialMs / 60000);
  const initSec = Math.floor((initialMs % 60000) / 1000);
  const initMs = initialMs % 1000;

  const [minutes, setMinutes] = useState(initMin ? String(initMin) : "1");
  const [seconds, setSeconds] = useState(initSec ? String(initSec).padStart(2, "0") : "");
  const [millis, setMillis] = useState(initMs ? String(initMs).padStart(3, "0") : "");

  const secRef = useRef<HTMLInputElement>(null);
  const msRef = useRef<HTMLInputElement>(null);

  // Notificar al componente padre cada vez que cambien los campos
  useEffect(() => {
    const minNum = Number(minutes) || 0;
    const secNum = Number(seconds) || 0;
    const msNum = Number(millis.padEnd(3, "0")) || 0; // Ajustar pad para conservar la escala de milisegundos

    const totalMs = (minNum * 60 + secNum) * 1000 + msNum;
    onChange(totalMs);
  }, [minutes, seconds, millis, onChange]);

  return (
    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-3 w-fit font-mono text-xl">
      {/* Minutos */}
      <input
        type="number"
        min="0"
        max="9"
        placeholder="1"
        value={minutes}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value.slice(0, 1);
          setMinutes(val);
          if (val) secRef.current?.focus(); // Auto-focus a segundos
        }}
        className="w-10 text-center bg-transparent text-cyan-400 focus:outline-none focus:bg-slate-900 rounded disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <span className="text-slate-500 font-bold">:</span>

      {/* Segundos */}
      <input
        ref={secRef}
        type="number"
        min="0"
        max="59"
        placeholder="12"
        value={seconds}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value.slice(0, 2);
          setSeconds(val);
          if (val.length === 2) msRef.current?.focus(); // Auto-focus a milisegundos
        }}
        className="w-12 text-center bg-transparent text-white focus:outline-none focus:bg-slate-900 rounded disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <span className="text-slate-500 font-bold">.</span>

      {/* Milisegundos */}
      <input
        ref={msRef}
        type="number"
        min="0"
        max="999"
        placeholder="345"
        value={millis}
        disabled={disabled}
        onChange={(e) => {
          setMillis(e.target.value.slice(0, 3));
        }}
        className="w-16 text-center bg-transparent text-slate-300 focus:outline-none focus:bg-slate-900 rounded disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}