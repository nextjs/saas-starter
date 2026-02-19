'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function SubmitButton({ isPopular }: { isPopular?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={`w-full h-20 sm:h-24 rounded-[2rem] font-black tracking-[0.3em] uppercase transition-all duration-500 active:scale-[0.98] text-sm sm:text-base ${
        isPopular
          ? 'bg-[#fbbf24] text-black hover:bg-[#fbbf24]/90 shadow-2xl shadow-[#fbbf24]/20'
          : 'bg-white text-black hover:bg-zinc-200'
      }`}
    >
      {pending ? (
        <span className="flex items-center gap-3">
          <Loader2 className="animate-spin size-5" />
          AUTHORIZING...
        </span>
      ) : (
        <span className="flex items-center gap-3">
          ACTIVATE SESSION
          <ArrowRight className="size-5" />
        </span>
      )}
    </Button>
  );
}
