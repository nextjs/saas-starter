import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PolishButtonProps {
  onClick: () => void;
  className?: string;
}

export function PolishButton({ onClick, className }: PolishButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 py-6 border-2 rounded-2xl transition-all active:scale-[0.95] font-black tracking-[0.3em] text-[10px] uppercase italic border-[#06b6d4]/20 bg-[#06b6d4]/5 text-[#06b6d4]",
        className
      )}
    >
      <Wand2 className="size-4" />
      POLISH
    </button>
  );
}
