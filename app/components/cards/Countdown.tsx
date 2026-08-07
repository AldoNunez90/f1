"use client";

import { useEffect, useState, useMemo } from "react";

interface CountdownProps {
  targetDate?: string;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const timeData = useMemo(() => {
    if (!targetDate) return null;

    const targetTime = new Date(targetDate).getTime();
    const diff = targetTime - now;

    if (diff <= 0) return "expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }, [targetDate, now]);

  // Manejo de estados especiales (Sin fecha o finalizada)
  if (!timeData) {
    return <span className="text-sm font-semibold">No disponible</span>;
  }

  if (timeData === "expired") {
    return <span className="text-sm font-bold text-red-500">Finalizada</span>;
  }

  const units = [
    { value: timeData.days, label: "d" },
    { value: timeData.hours, label: "h" },
    { value: timeData.minutes, label: "m" },
    { value: timeData.seconds, label: "s" },
  ];

  return (
    <div className="flex items-baseline gap-2 font-mono">
      {units.map(({ value, label }) => (
        <div key={label} className="flex items-baseline gap-0.5">
          <span className="text-2xl  text-gray-100 dark:text-white">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}