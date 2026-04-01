import { BookText, CheckCheck, Clock3, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/landing/feature-card';

const features = [
  {
    icon: BookText,
    title: 'Organized notes',
    description:
      'Create clean notes with titles, tags, and folders to find everything quickly.'
  },
  {
    icon: CheckCheck,
    title: 'Actionable tasks',
    description:
      'Turn ideas into checklists and keep your priorities in one focused place.'
  },
  {
    icon: Clock3,
    title: 'Fast workflow',
    description:
      'A minimal interface designed to help you write and review notes without distractions.'
  }
];

export default function HomePage() {
  return (
    <main className="bg-gradient-to-b from-blue-50 to-white">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          <Sparkles className="size-4" />
          Minimal note taking for focused teams
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-blue-950 sm:text-5xl">
          Capture ideas quickly. Keep your notes clear.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-blue-900/70 sm:text-lg">
          Our note taking app gives you a simple workspace to write, organize,
          and revisit your best thinking.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700">
            <Link href="/sign-up">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-blue-200 text-blue-800 hover:bg-blue-50">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-5 px-4 pb-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </section>
    </main>
  );
}
