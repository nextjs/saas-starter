import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function ActivityPageSkeleton() {
  return (
    <section className="flex-1 p-4 lg:p-8 bg-black min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 border-2 border-gold rounded-lg">
          <Activity className="size-6 text-gold" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase italic">
          Activity <span className="text-gold">Log</span>
        </h1>
      </div>

      <Card className="bg-zinc-950 border-zinc-800 rounded-3xl overflow-hidden max-w-3xl animate-pulse">
        <CardHeader className="border-b border-zinc-900 pb-6">
          <CardTitle className="text-white text-xl uppercase italic font-black">Loading History...</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px] pt-8" />
      </Card>
    </section>
  );
}
