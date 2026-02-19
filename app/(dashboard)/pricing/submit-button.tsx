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
      className={`w-full rounded-full py-6 font-black tracking-widest uppercase transition-all duration-300 ${
        isPopular
          ? 'bg-gold text-black hover:bg-yellow-500'
          : 'bg-white text-black hover:bg-zinc-200'
      }`}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Processing...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
