import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhanceButtonProps {
  onClick: () => void;
  className?: string;
}

export function EnhanceButton({ onClick, className }: EnhanceButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 py-6 border-2 rounded-2xl transition-all active:scale-[0.95] font-black tracking-[0.3em] text-[10px] uppercase italic border-[#5850ec]/20 bg-[#5850ec]/5 text-[#5850ec]",
        className
      )}
    >
      <Wand2 className="size-4" />
      ENHANCE
    </button>
  );
}
