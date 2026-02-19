import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SparkButtonProps {
  onClick: () => void;
  className?: string;
}

export function SparkButton({ onClick, className }: SparkButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 py-6 border-2 rounded-2xl transition-all active:scale-[0.95] font-black tracking-[0.3em] text-[10px] uppercase italic border-[#fbbf24]/20 bg-[#fbbf24]/5 text-[#fbbf24]",
        className
      )}
    >
      <Sparkles className="size-4" />
      SPARK
    </button>
  );
}
