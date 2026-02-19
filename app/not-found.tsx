import Link from 'next/link';
import { Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="max-w-md w-full space-y-8 text-center bg-zinc-950 border-2 border-zinc-900 p-12 rounded-[3rem] shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 border-2 border-gold rounded-2xl bg-zinc-900">
            <Music2 className="size-12 text-gold" />
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tight uppercase italic">
          404 <span className="text-gold">Lost</span>
        </h1>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-sm">
          This track seems to have been deleted from the playlist.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button className="w-full bg-gold text-black hover:bg-yellow-500 rounded-full py-6 font-black uppercase tracking-widest transition-all">
              Back to Studio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
