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

  const countdownText = useMemo(() => {
    if (!targetDate) return "No disponible";

    const targetTime = new Date(targetDate).getTime();
    const diff = targetTime - now;

    if (diff <= 0) return "Finalizada";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, [targetDate, now]);

  return <span>{countdownText}</span>;
}