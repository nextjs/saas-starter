'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export function Waveform({ className, active = false }: { className?: string; active?: boolean }) {
  const [bars, setBars] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize bars
    setBars(Array.from({ length: 40 }, () => Math.random() * 100));

    if (active) {
      intervalRef.current = setInterval(() => {
        setBars(prev => prev.map(val => {
          const change = (Math.random() - 0.5) * 30;
          return Math.max(10, Math.min(100, val + change));
        }));
      }, 100);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  return (
    <div className={cn("flex items-end gap-[2px] h-12 w-full", className)}>
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 bg-gold/30 rounded-full transition-all duration-150",
            active && "bg-gold animate-pulse"
          )}
          style={{ height: `${height}%`, animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  );
}
